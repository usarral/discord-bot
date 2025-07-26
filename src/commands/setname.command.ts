import {
	ActionRowBuilder,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	ModalBuilder,
	type ModalSubmitInteraction,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js"
import { ConfigStore } from "../storage/config.store"
import { BaseCommand } from "./base.command"

export class SetNameCommand extends BaseCommand {
	public name = "setname"
	public builder = new SlashCommandBuilder()
		.setName("setname")
		.setDescription("Cambia el nombre del bot en este servidor")

	protected requiresPermissions = false
	private configStore = new ConfigStore()

	public async executeCommand(
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		console.log(
			`[SET_NAME] 🏷️ Set name command initiated by ${interaction.user.tag}`,
		)

		// Check configuration permissions
		const hasConfigPerms = await this.checkConfigurationPermissions(interaction)
		if (!hasConfigPerms) {
			console.log(`[SET_NAME] ❌ Permission denied for ${interaction.user.tag}`)
			return
		}

		if (!interaction.guild) {
			await interaction.reply({
				content: "❌ Este comando solo funciona en servidores.",
				ephemeral: true,
			})
			return
		}

		// Verificar permisos del bot para cambiar nickname
		const botMember = interaction.guild.members.me
		if (!botMember) {
			await interaction.reply({
				content:
					"❌ No se pudo acceder a la información del bot en este servidor.",
				ephemeral: true,
			})
			return
		}

		console.log(`[SET_NAME] 🔍 Bot permissions check:`, {
			hasChangeNickname: botMember.permissions.has("ChangeNickname"),
			hasManageNicknames: botMember.permissions.has("ManageNicknames"),
			isOwner: interaction.guild.ownerId === botMember.user.id,
			currentNickname: botMember.nickname,
			username: botMember.user.username,
		})

		if (!botMember.permissions.has("ChangeNickname")) {
			const embed = new EmbedBuilder()
				.setTitle("❌ Permisos Insuficientes")
				.setDescription(
					"El bot no tiene permisos para cambiar su propio nickname.",
				)
				.setColor(0xff0000)
				.addFields(
					{
						name: "🔧 Solución",
						value:
							"Asegúrate de que el bot tenga el permiso **'Cambiar Nickname'** o **'Gestionar Nicknames'**",
						inline: false,
					},
					{
						name: "📋 Permisos actuales",
						value: botMember.permissions.has("ManageNicknames")
							? "✅ Gestionar Nicknames\n❌ Cambiar Nickname"
							: "❌ Sin permisos de nickname",
						inline: false,
					},
				)

			await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			})
			return
		}

		// Mostrar modal para el nuevo nombre
		await this.showNameModal(interaction)
	}

	private async showNameModal(
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		if (!interaction.guild) return

		const config = await this.configStore.getConfig(interaction.guild.id)

		const modal = new ModalBuilder()
			.setCustomId("setname_modal")
			.setTitle("Cambiar Nombre del Bot")

		const nameInput = new TextInputBuilder()
			.setCustomId("bot_name")
			.setLabel("Nuevo nombre del bot")
			.setStyle(TextInputStyle.Short)
			.setPlaceholder("MoniBot, Asistente, Helper...")
			.setValue(config?.botName || "MoniBot")
			.setRequired(true)
			.setMaxLength(32) // Discord nickname limit
			.setMinLength(1)

		const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
			nameInput,
		)

		modal.addComponents(row)

		await interaction.showModal(modal)
	}

	public async handleModalSubmit(
		interaction: ModalSubmitInteraction,
	): Promise<void> {
		if (interaction.customId !== "setname_modal") return

		const newName = interaction.fields.getTextInputValue("bot_name")
		console.log(`[SET_NAME] 🏷️ Changing bot name to: ${newName}`)

		if (!interaction.guild) return

		try {
			// Actualizar la configuración
			let config = await this.configStore.getConfig(interaction.guild.id)

			if (!config) {
				// Crear configuración básica si no existe
				config = await this.configStore.createDefaultConfig(
					interaction.guild.id,
					interaction.user.id,
					interaction.guild.name,
				)
			}

			const oldName = config.botName
			config.botName = newName
			await this.configStore.saveConfig(config)

			// Actualizar el nickname del bot
			const botMember = interaction.guild.members.me
			if (botMember) {
				console.log(
					`[SET_NAME] 🔄 Changing nickname from "${botMember.nickname || botMember.user.username}" to "${newName}"`,
				)

				try {
					await botMember.setNickname(
						newName,
						`Nombre cambiado por ${interaction.user.tag}`,
					)

					// Verificar que se aplicó el cambio
					await interaction.guild.members.fetch(botMember.user.id)
					const updatedMember = interaction.guild.members.me
					const actualNickname =
						updatedMember?.nickname || updatedMember?.user.username

					console.log(
						`[SET_NAME] 📋 Update result: expected="${newName}", actual="${actualNickname}"`,
					)

					if (actualNickname !== newName) {
						console.log(`[SET_NAME] ⚠️ Nickname update may have failed silently`)
					} else {
						console.log(
							`[SET_NAME] ✅ Bot nickname updated from "${oldName}" to "${newName}"`,
						)
					}
				} catch (nicknameError) {
					console.error(`[SET_NAME] ❌ Failed to set nickname:`, nicknameError)
					throw new Error(`No se pudo cambiar el nickname: ${nicknameError}`)
				}
			}

			const embed = new EmbedBuilder()
				.setTitle("✅ Nombre del Bot Actualizado")
				.setDescription(`El nombre del bot ha sido cambiado exitosamente.`)
				.setColor(0x00ff00)
				.addFields(
					{
						name: "🤖 Nombre anterior",
						value: oldName || "Sin configurar",
						inline: true,
					},
					{
						name: "🤖 Nombre nuevo",
						value: newName,
						inline: true,
					},
					{
						name: "👤 Cambiado por",
						value: `<@${interaction.user.id}>`,
						inline: true,
					},
				)
				.setTimestamp()

			await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			})
		} catch (error) {
			console.error("[SET_NAME] ❌ Error updating bot name:", error)

			await interaction.reply({
				content:
					"❌ Error al cambiar el nombre del bot. Verifica que el bot tenga los permisos necesarios.",
				ephemeral: true,
			})
		}
	}
}
