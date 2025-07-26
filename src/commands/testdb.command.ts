import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js"
import { GuildConfigModel } from "../models/guild.model"
import { DatabaseService } from "../services/database.service"
import { BaseCommand } from "./base.command"

export class TestDbCommand extends BaseCommand {
	public name = "testdb"
	public builder = new SlashCommandBuilder()
		.setName("testdb")
		.setDescription("Prueba la conexión a la base de datos")

	protected requiresPermissions = false

	public async executeCommand(
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		console.log(`[TEST_DB] 🧪 Testing database connection`)

		try {
			// Test database connection
			const dbService = DatabaseService.getInstance()
			const isConnected = dbService.getConnectionStatus()

			// Test MongoDB queries
			const totalConfigs = await GuildConfigModel.countDocuments()
			const allConfigs = await GuildConfigModel.find().lean()

			console.log(`[TEST_DB] 📊 Database stats:`, {
				connected: isConnected,
				totalConfigs,
				configs: allConfigs.map((c) => ({
					id: c._id,
					guildId: c.guildId,
					botName: c.botName,
					isConfigured: c.isConfigured,
				})),
			})

			const embed = new EmbedBuilder()
				.setTitle("🧪 Prueba de Base de Datos")
				.setColor(isConnected ? 0x00ff00 : 0xff0000)
				.addFields(
					{
						name: "🔗 Conexión",
						value: isConnected ? "✅ Conectado" : "❌ Desconectado",
						inline: true,
					},
					{
						name: "📊 Total Configuraciones",
						value: totalConfigs.toString(),
						inline: true,
					},
					{
						name: "📋 Configuraciones",
						value:
							allConfigs.length > 0
								? allConfigs
										.map((c) => `Guild: ${c.guildId} - ${c.botName}`)
										.join("\n")
										.substring(0, 1000)
								: "No hay configuraciones guardadas",
						inline: false,
					},
				)
				.setTimestamp()

			await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			})
		} catch (error) {
			console.error("[TEST_DB] ❌ Database test error:", error)

			const errorEmbed = new EmbedBuilder()
				.setTitle("❌ Error de Base de Datos")
				.setDescription(`Error: ${error}`)
				.setColor(0xff0000)
				.setTimestamp()

			await interaction.reply({
				embeds: [errorEmbed],
				ephemeral: true,
			})
		}
	}
}
