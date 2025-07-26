import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js"
import { BaseCommand } from "./base.command"

export class BotInfoCommand extends BaseCommand {
	public name = "botinfo"
	public builder = new SlashCommandBuilder()
		.setName("botinfo")
		.setDescription("Muestra información detallada del bot y sus permisos")

	protected requiresPermissions = false

	public async executeCommand(
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		if (!interaction.guild) {
			await interaction.reply({
				content: "❌ Este comando solo funciona en servidores.",
				ephemeral: true,
			})
			return
		}

		try {
			const botMember = interaction.guild.members.me
			if (!botMember) {
				await interaction.reply({
					content: "❌ No se pudo acceder a la información del bot.",
					ephemeral: true,
				})
				return
			}

			const botUser = botMember.user
			const permissions = botMember.permissions

			// Permisos relevantes para nickname
			const nicknamePerms = {
				changeNickname: permissions.has("ChangeNickname"),
				manageNicknames: permissions.has("ManageNicknames"),
				administrator: permissions.has("Administrator"),
			}

			// Información del rol más alto
			const highestRole = botMember.roles.highest
			const roleHierarchy = botMember.roles.cache
				.filter((role) => role.name !== "@everyone")
				.sort((a, b) => b.position - a.position)
				.first(5)

			const embed = new EmbedBuilder()
				.setTitle("🤖 Información del Bot")
				.setDescription(
					`Detalles completos de **${botUser.username}** en este servidor`,
				)
				.setColor(0x0099ff)
				.setThumbnail(botUser.displayAvatarURL())
				.addFields(
					{
						name: "👤 Información Básica",
						value: [
							`**Usuario:** ${botUser.username}#${botUser.discriminator}`,
							`**Nickname:** ${botMember.nickname || "Sin nickname"}`,
							`**ID:** ${botUser.id}`,
							`**Creado:** <t:${Math.floor(botUser.createdTimestamp / 1000)}:R>`,
							`**Se unió:** <t:${Math.floor((botMember.joinedTimestamp || Date.now()) / 1000)}:R>`,
						].join("\n"),
						inline: false,
					},
					{
						name: "🎭 Permisos de Nickname",
						value: [
							`${nicknamePerms.administrator ? "✅" : "❌"} Administrador`,
							`${nicknamePerms.changeNickname ? "✅" : "❌"} Cambiar Nickname`,
							`${nicknamePerms.manageNicknames ? "✅" : "❌"} Gestionar Nicknames`,
						].join("\n"),
						inline: true,
					},
					{
						name: "🏷️ Rol Más Alto",
						value: [
							`**Nombre:** ${highestRole.name}`,
							`**Posición:** ${highestRole.position}`,
							`**Color:** ${highestRole.hexColor}`,
							`**Mentionable:** ${highestRole.mentionable ? "Sí" : "No"}`,
						].join("\n"),
						inline: true,
					},
					{
						name: "📊 Jerarquía de Roles",
						value:
							roleHierarchy.length > 0
								? roleHierarchy
										.map((role) => `${role.position}. ${role.name}`)
										.join("\n")
								: "Solo tiene @everyone",
						inline: false,
					},
					{
						name: "🔧 Diagnóstico",
						value: [
							`**¿Puede cambiar nickname?** ${nicknamePerms.changeNickname || nicknamePerms.manageNicknames || nicknamePerms.administrator ? "✅ Sí" : "❌ No"}`,
							`**¿Es propietario?** ${interaction.guild.ownerId === botUser.id ? "✅ Sí" : "❌ No"}`,
							`**¿Tiene roles elevados?** ${highestRole.position > 1 ? "✅ Sí" : "❌ No"}`,
						].join("\n"),
						inline: false,
					},
				)
				.setFooter({
					text: `Solicitado por ${interaction.user.tag}`,
					iconURL: interaction.user.displayAvatarURL(),
				})
				.setTimestamp()

			await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			})
		} catch (error) {
			console.error("[BOT_INFO] ❌ Error getting bot info:", error)

			await interaction.reply({
				content: "❌ Error al obtener la información del bot.",
				ephemeral: true,
			})
		}
	}
}
