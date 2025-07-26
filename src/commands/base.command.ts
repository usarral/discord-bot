import type {
	ChatInputCommandInteraction,
	GuildMember,
	SlashCommandBuilder,
} from "discord.js"
import { PermissionService } from "../services/permission.service"

export abstract class BaseCommand {
	abstract name: string
	abstract builder: SlashCommandBuilder
	protected requiresPermissions: boolean = true
	protected allowedRoles?: string[]

	private permissionService = new PermissionService()

	abstract executeCommand(
		interaction: ChatInputCommandInteraction,
	): Promise<void>

	public async execute(
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		// Skip permission check if not required
		if (!this.requiresPermissions) {
			await this.executeCommand(interaction)
			return
		}

		// Check if in guild
		if (!interaction.guild) {
			await interaction.reply({
				content: "❌ Este comando solo puede usarse en un servidor.",
				ephemeral: true,
			})
			return
		}

		// Check permissions
		const hasPermission = await this.permissionService.hasPermission(
			interaction.member as GuildMember,
			this.name,
		)

		if (!hasPermission) {
			await interaction.reply({
				content: "❌ No tienes permisos para usar este comando.",
				ephemeral: true,
			})
			return
		}

		// Execute the actual command
		await this.executeCommand(interaction)
	}

	protected async checkAdminPermissions(
		interaction: ChatInputCommandInteraction,
	): Promise<boolean> {
		if (!interaction.guild) return false

		const isAdmin = await this.permissionService.isAdmin(
			interaction.member as GuildMember,
		)

		if (!isAdmin) {
			await interaction.reply({
				content:
					"❌ No tienes permisos de administrador para usar este comando.",
				ephemeral: true,
			})
			return false
		}

		return true
	}

	protected async checkConfigurationPermissions(
		interaction: ChatInputCommandInteraction,
	): Promise<boolean> {
		if (!interaction.guild) return false

		const canConfigure = await this.permissionService.canConfigureBot(
			interaction.member as GuildMember,
		)

		if (!canConfigure) {
			await interaction.reply({
				content:
					"❌ No tienes permisos para configurar el bot. Solo los administradores pueden hacerlo.",
				ephemeral: true,
			})
			return false
		}

		return true
	}
}
