import type { GuildMember } from "discord.js"
import { PermissionsBitField } from "discord.js"
import { ConfigStore } from "../storage/config.store"

export class PermissionService {
	private configStore: ConfigStore

	constructor() {
		this.configStore = new ConfigStore()
	}

	public async hasPermission(
		member: GuildMember,
		command: string,
	): Promise<boolean> {
		const guildId = member.guild.id

		// Server owner always has permission
		if (member.guild.ownerId === member.id) {
			return true
		}

		// Check if user has Administrator permission
		if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return true
		}

		const config = await this.configStore.getConfig(guildId)
		if (!config) {
			return false
		}

		// Check if user is the setup creator
		if (config.setupBy === member.id) {
			return true
		}

		// Check admin roles
		const hasAdminRole = member.roles.cache.some((role) =>
			config.adminRoles.includes(role.id),
		)
		if (hasAdminRole) {
			return true
		}

		// Check command-specific roles
		const allowedRoles = config.allowedRoles.get(command)
		if (allowedRoles && allowedRoles.length > 0) {
			return member.roles.cache.some((role) => allowedRoles.includes(role.id))
		}

		// Check moderator roles for certain commands
		const moderatorCommands = ["status", "permisos"]
		if (moderatorCommands.includes(command)) {
			return member.roles.cache.some((role) =>
				config.moderatorRoles.includes(role.id),
			)
		}

		return false
	}

	public async isAdmin(member: GuildMember): Promise<boolean> {
		const guildId = member.guild.id

		// Server owner is always admin
		if (member.guild.ownerId === member.id) {
			return true
		}

		// Check if user has Administrator permission
		if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return true
		}

		const config = await this.configStore.getConfig(guildId)
		if (!config) {
			return false
		}

		// Check if user is the setup creator
		if (config.setupBy === member.id) {
			return true
		}

		// Check admin roles
		return member.roles.cache.some((role) =>
			config.adminRoles.includes(role.id),
		)
	}

	public async canConfigureBot(member: GuildMember): Promise<boolean> {
		const guildId = member.guild.id

		// Server owner can always configure
		if (member.guild.ownerId === member.id) {
			return true
		}

		// Check if user has Administrator permission
		if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return true
		}

		const config = await this.configStore.getConfig(guildId)
		if (!config) {
			// If no config exists, only admins can create it
			return member.permissions.has(PermissionsBitField.Flags.Administrator)
		}

		// Check if user is the setup creator
		if (config.setupBy === member.id) {
			return true
		}

		// Check admin roles
		return member.roles.cache.some((role) =>
			config.adminRoles.includes(role.id),
		)
	}

	public async setCommandPermissions(
		guildId: string,
		command: string,
		roleIds: string[],
	): Promise<boolean> {
		const config = await this.configStore.getConfig(guildId)
		if (!config) {
			return false
		}

		config.allowedRoles.set(command, roleIds)
		return this.configStore.saveConfig(config)
	}

	public async addAdminRole(guildId: string, roleId: string): Promise<boolean> {
		const config = await this.configStore.getConfig(guildId)
		if (!config) {
			return false
		}

		if (!config.adminRoles.includes(roleId)) {
			config.adminRoles.push(roleId)
			return this.configStore.saveConfig(config)
		}
		return true
	}

	public async removeAdminRole(
		guildId: string,
		roleId: string,
	): Promise<boolean> {
		const config = await this.configStore.getConfig(guildId)
		if (!config) {
			return false
		}

		const index = config.adminRoles.indexOf(roleId)
		if (index > -1) {
			config.adminRoles.splice(index, 1)
			return this.configStore.saveConfig(config)
		}
		return true
	}

	public async addModeratorRole(
		guildId: string,
		roleId: string,
	): Promise<boolean> {
		const config = await this.configStore.getConfig(guildId)
		if (!config) {
			return false
		}

		if (!config.moderatorRoles.includes(roleId)) {
			config.moderatorRoles.push(roleId)
			return this.configStore.saveConfig(config)
		}
		return true
	}

	public async removeModeratorRole(
		guildId: string,
		roleId: string,
	): Promise<boolean> {
		const config = await this.configStore.getConfig(guildId)
		if (!config) {
			return false
		}

		const index = config.moderatorRoles.indexOf(roleId)
		if (index > -1) {
			config.moderatorRoles.splice(index, 1)
			return this.configStore.saveConfig(config)
		}
		return true
	}
}
