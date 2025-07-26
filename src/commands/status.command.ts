import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js"
import { DatabaseService } from "../services/database.service"
import { getSystemInfo } from "../services/system.service"
import { BaseCommand } from "./base.command"

export class StatusCommand extends BaseCommand {
	public name = "status"
	public builder = new SlashCommandBuilder()
		.setName("status")
		.setDescription("Muestra el estado del sistema y del bot")

	// Status command requires permissions
	protected requiresPermissions = true

	public async executeCommand(
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		await interaction.deferReply()

		try {
			// Get system information
			const systemInfo = await getSystemInfo()

			// Get database status
			const dbService = DatabaseService.getInstance()
			const dbHealth = await dbService.healthCheck()

			// Get bot uptime
			const botUptime = process.uptime()
			const botUptimeFormatted = this.formatUptime(botUptime)

			// Get memory usage
			const memUsage = process.memoryUsage()
			const memoryUsed = Math.round(memUsage.heapUsed / 1024 / 1024)
			const memoryTotal = Math.round(memUsage.heapTotal / 1024 / 1024)

			const embed = new EmbedBuilder()
				.setTitle("📊 Estado del Sistema")
				.setColor(0x00ff00)
				.addFields(
					{
						name: "💻 Sistema",
						value: [
							`**OS:** ${this.getOSName(systemInfo.platform)}`,
							`**${systemInfo.cpu}**`,
							`**${systemInfo.memory}**`,
							`**${systemInfo.disk}**`,
							`**${systemInfo.uptime}**`,
						].join("\n"),
						inline: true,
					},
					{
						name: "🤖 Bot",
						value: [
							`**Uptime:** ${botUptimeFormatted}`,
							`**Memoria:** ${memoryUsed}MB / ${memoryTotal}MB`,
							`**Node.js:** ${process.version}`,
							`**PID:** ${process.pid}`,
						].join("\n"),
						inline: true,
					},
					{
						name: "🗄️ Base de Datos",
						value: [
							`**Estado:** ${this.getDBStatusEmoji(dbHealth.status)} ${dbHealth.status}`,
							`**Latencia:** ${dbHealth.latency >= 0 ? `${dbHealth.latency}ms` : "N/A"}`,
						].join("\n"),
						inline: true,
					},
				)
				.setTimestamp()
				.setFooter({
					text: `Solicitado por ${interaction.user.displayName}`,
					iconURL: interaction.user.displayAvatarURL(),
				})

			await interaction.editReply({ embeds: [embed] })
		} catch (error) {
			console.error("Error in status command:", error)

			const errorEmbed = new EmbedBuilder()
				.setTitle("❌ Error")
				.setDescription("Hubo un error al obtener la información del sistema.")
				.setColor(0xff0000)
				.addFields({
					name: "🤖 Bot",
					value: [
						`**Uptime:** ${this.formatUptime(process.uptime())}`,
						`**Node.js:** ${process.version}`,
						`**Estado:** Funcionando`,
					].join("\n"),
				})
				.setTimestamp()

			await interaction.editReply({ embeds: [errorEmbed] })
		}
	}

	private getOSName(platform: NodeJS.Platform): string {
		switch (platform) {
			case "linux":
				return "Linux"
			case "darwin":
				return "macOS"
			case "win32":
				return "Windows"
			case "freebsd":
				return "FreeBSD"
			case "openbsd":
				return "OpenBSD"
			default:
				return platform
		}
	}

	private getDBStatusEmoji(status: string): string {
		switch (status) {
			case "connected":
				return "🟢"
			case "disconnected":
				return "🟡"
			case "error":
				return "🔴"
			default:
				return "⚪"
		}
	}

	private formatUptime(seconds: number): string {
		const days = Math.floor(seconds / 86400)
		const hours = Math.floor((seconds % 86400) / 3600)
		const minutes = Math.floor((seconds % 3600) / 60)
		const secs = Math.floor(seconds % 60)

		const parts: string[] = []
		if (days > 0) parts.push(`${days}d`)
		if (hours > 0) parts.push(`${hours}h`)
		if (minutes > 0) parts.push(`${minutes}m`)
		if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

		return parts.join(" ")
	}
}
