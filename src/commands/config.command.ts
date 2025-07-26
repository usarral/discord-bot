import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js"
import { ConfigStore } from "../storage/config.store"
import { BaseCommand } from "./base.command"

export class ConfigCommand extends BaseCommand {
	public name = "config"
	public builder = new SlashCommandBuilder()
		.setName("config")
		.setDescription("Muestra la configuración actual del servidor")

	protected requiresPermissions = false
	private configStore = new ConfigStore()

	public async executeCommand(
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		console.log(`[CONFIG] 📋 Showing config for guild ${interaction.guild?.id}`)

		if (!interaction.guild) {
			await interaction.reply({
				content: "❌ Este comando solo funciona en servidores.",
				ephemeral: true,
			})
			return
		}

		try {
			const config = await this.configStore.getConfig(interaction.guild.id)

			if (!config) {
				const embed = new EmbedBuilder()
					.setTitle("⚙️ Configuración del Servidor")
					.setDescription(
						"❌ No hay configuración guardada para este servidor.\n\nUsa `/setup` para configurar el bot.",
					)
					.setColor(0xff9900)
					.setTimestamp()

				await interaction.reply({
					embeds: [embed],
					ephemeral: true,
				})
				return
			}

			const embed = new EmbedBuilder()
				.setTitle("⚙️ Configuración del Servidor")
				.setDescription("Configuración actual del bot para este servidor:")
				.setColor(0x0099ff)
				.addFields(
					{
						name: "🤖 Nombre del Bot",
						value: config.botName,
						inline: true,
					},
					{
						name: "🕐 Zona Horaria",
						value: config.timezone,
						inline: true,
					},
					{
						name: "🌐 Idioma",
						value: config.language === "es" ? "🇪🇸 Español" : "🇺🇸 English",
						inline: true,
					},
					{
						name: "⚙️ Estado",
						value: config.isConfigured ? "✅ Configurado" : "⚠️ Parcial",
						inline: true,
					},
					{
						name: "👤 Configurado por",
						value: `<@${config.setupBy}>`,
						inline: true,
					},
					{
						name: "📅 Última modificación",
						value: config.lastModified.toLocaleDateString("es-ES"),
						inline: true,
					},
				)
				.setFooter({
					text: "Usa /setup para modificar la configuración",
				})
				.setTimestamp()

			await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			})
		} catch (error) {
			console.error("[CONFIG] ❌ Error fetching config:", error)

			await interaction.reply({
				content: "❌ Error al obtener la configuración del servidor.",
				ephemeral: true,
			})
		}
	}
}
