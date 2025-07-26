import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js"
import { ConfigStore } from "../storage/config.store"
import { BaseCommand } from "./base.command"

export class PermissionsCommand extends BaseCommand {
	public name = "permisos"
	public builder = new SlashCommandBuilder()
		.setName("permisos")
		.setDescription("Gestiona los permisos del bot")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("ver")
				.setDescription("Muestra la configuración actual de permisos"),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("configurar")
				.setDescription("Configura permisos para comandos específicos"),
		) as SlashCommandBuilder

	// Permissions command requires admin permissions but checked in executeCommand
	protected requiresPermissions = false
	private configStore = new ConfigStore()

	public async executeCommand(
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		// Check admin permissions specifically
		const hasAdminPerms = await this.checkAdminPermissions(interaction)
		if (!hasAdminPerms) return

		if (!interaction.guild) return

		const subcommand = interaction.options.getSubcommand()

		switch (subcommand) {
			case "ver":
				await this.showPermissions(interaction)
				break
			case "configurar":
				await this.configurePermissions(interaction)
				break
		}
	}

	private async showPermissions(
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		if (!interaction.guild) return

		const config = await this.configStore.getConfig(interaction.guild.id)

		if (!config) {
			await interaction.reply({
				content:
					"❌ No se encontró configuración para este servidor. Ejecuta `/setup` primero.",
				ephemeral: true,
			})
			return
		}

		const embed = new EmbedBuilder()
			.setTitle("🔐 Configuración de Permisos")
			.setColor(0x5865f2)
			.addFields(
				{
					name: "👑 Propietario del Servidor",
					value: `<@${interaction.guild.ownerId}>`,
					inline: true,
				},
				{
					name: "⚙️ Configurador del Bot",
					value: `<@${config.setupBy}>`,
					inline: true,
				},
				{
					name: "🛡️ Roles de Administrador",
					value:
						config.adminRoles.length > 0
							? config.adminRoles.map((roleId) => `<@&${roleId}>`).join("\n")
							: "Ninguno configurado",
					inline: false,
				},
				{
					name: "🛡️ Roles de Moderador",
					value:
						config.moderatorRoles.length > 0
							? config.moderatorRoles
									.map((roleId) => `<@&${roleId}>`)
									.join("\n")
							: "Ninguno configurado",
					inline: false,
				},
			)

		// Add command-specific permissions
		if (config.allowedRoles.size > 0) {
			const commandPerms: string[] = []
			for (const [command, roles] of config.allowedRoles.entries()) {
				if (roles.length > 0) {
					commandPerms.push(
						`**/${command}:** ${roles.map((roleId) => `<@&${roleId}>`).join(", ")}`,
					)
				}
			}

			if (commandPerms.length > 0) {
				embed.addFields({
					name: "🎯 Permisos por Comando",
					value: commandPerms.join("\n"),
					inline: false,
				})
			}
		}

		embed.addFields({
			name: "📋 Información",
			value: [
				"• **Propietario** y **Configurador** tienen acceso completo",
				"• **Administradores** pueden usar todos los comandos",
				"• **Moderadores** pueden usar comandos básicos",
				"• Los permisos específicos por comando se aplican además de los roles",
			].join("\n"),
			inline: false,
		})

		await interaction.reply({ embeds: [embed], ephemeral: true })
	}

	private async configurePermissions(
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		if (!interaction.guild) return

		const embed = new EmbedBuilder()
			.setTitle("⚙️ Configurar Permisos")
			.setDescription("Selecciona qué quieres configurar:")
			.setColor(0x9932cc)

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("config_admin_roles")
				.setLabel("Roles de Administrador")
				.setStyle(ButtonStyle.Primary)
				.setEmoji("🛡️"),
			new ButtonBuilder()
				.setCustomId("config_mod_roles")
				.setLabel("Roles de Moderador")
				.setStyle(ButtonStyle.Secondary)
				.setEmoji("🛡️"),
			new ButtonBuilder()
				.setCustomId("config_command_perms")
				.setLabel("Permisos por Comando")
				.setStyle(ButtonStyle.Success)
				.setEmoji("🎯"),
		)

		await interaction.reply({
			embeds: [embed],
			components: [row],
			ephemeral: true,
		})
	}
}
