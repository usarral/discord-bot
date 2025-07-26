import {
	ActionRowBuilder,
	ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	type ChatInputCommandInteraction,
	ComponentType,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js"
import { rebootSystem } from "../services/system.service"
import { BaseCommand } from "./base.command"

export class RebootCommand extends BaseCommand {
	public name = "reboot"
	public builder = new SlashCommandBuilder()
		.setName("reboot")
		.setDescription(
			"Reinicia el sistema del servidor (requiere permisos elevados)",
		)

	// Reboot requires admin permissions
	protected requiresPermissions = true

	public async executeCommand(
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		// Additional admin check for this sensitive command
		const hasAdminPerms = await this.checkAdminPermissions(interaction)
		if (!hasAdminPerms) return

		// Show confirmation dialog
		const embed = new EmbedBuilder()
			.setTitle("⚠️ Confirmación de Reinicio")
			.setDescription("Estás a punto de reiniciar el sistema del servidor.")
			.setColor(0xff6b00)
			.addFields(
				{
					name: "🔄 Acción",
					value: "Reinicio del sistema",
					inline: true,
				},
				{
					name: "⏱️ Tiempo",
					value: "Inmediato",
					inline: true,
				},
				{
					name: "⚠️ Advertencia",
					value:
						"Esta acción es irreversible y desconectará temporalmente el servidor.",
					inline: false,
				},
			)
			.setFooter({
				text: "Tienes 30 segundos para confirmar o cancelar",
			})

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("reboot_confirm")
				.setLabel("Confirmar Reinicio")
				.setStyle(ButtonStyle.Danger)
				.setEmoji("🔄"),
			new ButtonBuilder()
				.setCustomId("reboot_cancel")
				.setLabel("Cancelar")
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("❌"),
		)

		const response = await interaction.reply({
			embeds: [embed],
			components: [row],
			ephemeral: true,
		})

		try {
			const confirmation = await response.awaitMessageComponent({
				componentType: ComponentType.Button,
				time: 30000,
				filter: (i) => i.user.id === interaction.user.id,
			})

			if (confirmation.customId === "reboot_cancel") {
				await confirmation.update({
					content: "✅ Reinicio cancelado.",
					embeds: [],
					components: [],
				})
				return
			}

			if (confirmation.customId === "reboot_confirm") {
				await this.handleRebootConfirmation(confirmation)
			}
		} catch {
			await interaction.editReply({
				content:
					"⏰ Tiempo de confirmación agotado. Reinicio cancelado por seguridad.",
				embeds: [],
				components: [],
			})
		}
	}

	private async handleRebootConfirmation(
		interaction: ButtonInteraction,
	): Promise<void> {
		// Update the message to show processing
		const processingEmbed = new EmbedBuilder()
			.setTitle("🔄 Ejecutando Reinicio")
			.setDescription("Enviando comando de reinicio al sistema...")
			.setColor(0xffa500)

		await interaction.update({
			embeds: [processingEmbed],
			components: [],
		})

		try {
			// Execute reboot command
			const result = await rebootSystem()

			if (result.success) {
				const successEmbed = new EmbedBuilder()
					.setTitle("✅ Reinicio Iniciado")
					.setDescription("El comando de reinicio se ejecutó correctamente.")
					.setColor(0x00ff00)
					.addFields(
						{
							name: "📝 Resultado",
							value: result.message,
							inline: false,
						},
						{
							name: "⏱️ Estado",
							value: "El servidor se reiniciará en breve",
							inline: false,
						},
					)
					.setTimestamp()
					.setFooter({
						text: `Ejecutado por ${interaction.user.displayName}`,
						iconURL: interaction.user.displayAvatarURL(),
					})

				await interaction.editReply({ embeds: [successEmbed] })
			} else {
				const errorEmbed = new EmbedBuilder()
					.setTitle("❌ Error en el Reinicio")
					.setDescription("No se pudo ejecutar el comando de reinicio.")
					.setColor(0xff0000)
					.addFields(
						{
							name: "📝 Error",
							value: result.message,
							inline: false,
						},
						{
							name: "💡 Sugerencias",
							value: [
								"• Verifica que el bot tenga permisos sudo",
								"• Comprueba la configuración del sistema",
								"• Contacta al administrador del servidor",
							].join("\n"),
							inline: false,
						},
					)
					.setTimestamp()

				await interaction.editReply({ embeds: [errorEmbed] })
			}
		} catch (error) {
			console.error("Error executing reboot:", error)

			const errorEmbed = new EmbedBuilder()
				.setTitle("❌ Error Crítico")
				.setDescription(
					"Ocurrió un error inesperado al intentar reiniciar el sistema.",
				)
				.setColor(0xff0000)
				.addFields({
					name: "📝 Error",
					value: error instanceof Error ? error.message : "Error desconocido",
					inline: false,
				})
				.setTimestamp()

			await interaction.editReply({ embeds: [errorEmbed] })
		}
	}
}
