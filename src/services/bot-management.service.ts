import type { Guild } from "discord.js"
import { ConfigStore } from "../storage/config.store"

export class BotManagementService {
	private configStore = new ConfigStore()
	private static instance: BotManagementService

	public static getInstance(): BotManagementService {
		if (!BotManagementService.instance) {
			BotManagementService.instance = new BotManagementService()
		}
		return BotManagementService.instance
	}

	/**
	 * Actualiza el nickname del bot en el servidor según la configuración
	 */
	public async updateBotNickname(guild: Guild): Promise<boolean> {
		try {
			console.log(
				`[BOT_MGMT] 🤖 Updating bot nickname for guild ${guild.name} (${guild.id})`,
			)

			// Obtener la configuración del servidor
			const config = await this.configStore.getConfig(guild.id)
			if (!config || !config.botName) {
				console.log(
					`[BOT_MGMT] ⚠️ No config or bot name found for guild ${guild.id}`,
				)
				return false
			}

			// Obtener el miembro del bot en el servidor
			const botMember = guild.members.me
			if (!botMember) {
				console.log(`[BOT_MGMT] ❌ Bot member not found in guild ${guild.id}`)
				return false
			}

			console.log(`[BOT_MGMT] 📊 Current bot info:`, {
				username: botMember.user.username,
				currentNickname: botMember.nickname,
				targetName: config.botName,
				hasChangeNicknamePermission:
					botMember.permissions.has("ChangeNickname"),
				hasManageNicknamesPermission:
					botMember.permissions.has("ManageNicknames"),
				isOwner: guild.ownerId === botMember.user.id,
			})

			// Verificar si el nombre ya es el correcto
			const currentNickname = botMember.nickname || botMember.user.username
			if (currentNickname === config.botName) {
				console.log(
					`[BOT_MGMT] ✅ Bot nickname already correct: ${config.botName}`,
				)
				return true
			}

			// Verificar permisos específicos
			if (!botMember.permissions.has("ChangeNickname")) {
				console.log(`[BOT_MGMT] ❌ Bot doesn't have ChangeNickname permission`)
				console.log(
					`[BOT_MGMT] 🔍 Bot permissions:`,
					botMember.permissions.toArray(),
				)
				return false
			}

			console.log(
				`[BOT_MGMT] 🔄 Attempting to change nickname from "${currentNickname}" to "${config.botName}"`,
			)

			// Intentar cambiar el nickname
			await botMember.setNickname(
				config.botName,
				"Configuración del bot actualizada",
			)

			// Verificar que el cambio se aplicó
			await guild.members.fetch(botMember.user.id)
			const updatedMember = guild.members.me
			const newNickname =
				updatedMember?.nickname || updatedMember?.user.username

			console.log(
				`[BOT_MGMT] 📋 After update - Current nickname: "${newNickname}"`,
			)

			if (newNickname === config.botName) {
				console.log(
					`[BOT_MGMT] ✅ Bot nickname successfully updated to: ${config.botName}`,
				)
				return true
			} else {
				console.log(
					`[BOT_MGMT] ⚠️ Nickname update may have failed - expected: "${config.botName}", got: "${newNickname}"`,
				)
				return false
			}
		} catch (error) {
			console.error(`[BOT_MGMT] ❌ Error updating bot nickname:`, error)

			// Log más detalles del error
			if (error instanceof Error) {
				console.error(`[BOT_MGMT] 📋 Error details:`, {
					name: error.name,
					message: error.message,
					stack: error.stack?.split("\n").slice(0, 3),
				})
			}

			return false
		}
	}

	/**
	 * Actualiza el nickname del bot cuando se cambia la configuración
	 */
	public async onConfigChange(guildId: string, botName: string): Promise<void> {
		try {
			console.log(
				`[BOT_MGMT] 🔄 Config changed for guild ${guildId}, updating nickname to: ${botName}`,
			)

			// Aquí necesitaremos acceso al cliente de Discord
			// Por ahora solo logueamos, implementaremos la actualización en el bot service
		} catch (error) {
			console.error(`[BOT_MGMT] ❌ Error in config change handler:`, error)
		}
	}

	/**
	 * Verifica los permisos necesarios para cambiar el nickname
	 */
	public async canChangeBotNickname(guild: Guild): Promise<boolean> {
		try {
			const botMember = guild.members.me
			if (!botMember) return false

			// Verificar si el bot tiene permisos para cambiar su propio nickname
			return botMember.permissions.has("ChangeNickname")
		} catch (error) {
			console.error(`[BOT_MGMT] ❌ Error checking nickname permissions:`, error)
			return false
		}
	}
}
