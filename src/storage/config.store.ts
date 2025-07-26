import { GuildConfigModel } from "../models/guild.model"
import type { GuildConfig } from "../types/config.types.js"

export class ConfigStore {
	private cache = new Map<string, GuildConfig>()

	public async getConfig(guildId: string): Promise<GuildConfig | null> {
		console.log(`[CONFIG_STORE] 🔍 Getting config for guild ${guildId}`)

		// Check cache first
		const cached = this.cache.get(guildId)
		if (cached) {
			console.log(`[CONFIG_STORE] ⚡ Found in cache for guild ${guildId}`)
			return cached
		}

		try {
			console.log(`[CONFIG_STORE] 🔄 Querying MongoDB for guild ${guildId}`)
			const config = await GuildConfigModel.findOne({ guildId }).lean()
			if (config) {
				console.log(`[CONFIG_STORE] ✅ Found MongoDB document:`, {
					id: config._id,
					guildId: config.guildId,
					botName: config.botName,
					isConfigured: config.isConfigured,
				})

				// Convert MongoDB document to our interface
				const guildConfig: GuildConfig = {
					guildId: config.guildId,
					botName: config.botName,
					timezone: config.timezone,
					language: config.language,
					allowedRoles: new Map(Object.entries(config.allowedRoles || {})),
					adminRoles: config.adminRoles || [],
					moderatorRoles: config.moderatorRoles || [],
					channels: config.channels || {},
					features: config.features || {
						enableSystemCommands: true,
						enableMaintenance: true,
						enableStatusUpdates: false,
						autoRestartOnError: false,
					},
					serverInfo: config.serverInfo || {
						name: "",
						memberCount: 0,
						lastSeen: new Date(),
					},
					isConfigured: config.isConfigured || false,
					setupBy: config.setupBy,
					lastModified: config.lastModified || new Date(),
				}

				this.cache.set(guildId, guildConfig)
				console.log(`[CONFIG_STORE] 🎯 Cached config for guild ${guildId}`)
				return guildConfig
			}

			console.log(`[CONFIG_STORE] ❌ No config found for guild ${guildId}`)
			return null
		} catch (error) {
			console.error(
				`[CONFIG_STORE] ❌ Error fetching config for guild ${guildId}:`,
				error,
			)
			return null
		}
	}

	public async saveConfig(config: GuildConfig): Promise<boolean> {
		try {
			console.log(`[CONFIG_STORE] 💾 Saving config for guild ${config.guildId}`)
			console.log(`[CONFIG_STORE] 📊 Config data:`, {
				guildId: config.guildId,
				botName: config.botName,
				timezone: config.timezone,
				language: config.language,
				isConfigured: config.isConfigured,
			})

			// Convert Map to object for MongoDB storage
			const configToSave = {
				...config,
				allowedRoles: Object.fromEntries(config.allowedRoles),
				lastModified: new Date(),
			}

			console.log(`[CONFIG_STORE] 🔄 Attempting MongoDB save...`)
			const result = await GuildConfigModel.findOneAndUpdate(
				{ guildId: config.guildId },
				configToSave,
				{
					upsert: true,
					new: true,
				},
			)

			console.log(`[CONFIG_STORE] ✅ MongoDB save successful:`, result._id)
			console.log(`[CONFIG_STORE] 📋 Saved document:`, {
				id: result._id,
				guildId: result.guildId,
				botName: result.botName,
				isConfigured: result.isConfigured,
			})

			// Update cache
			this.cache.set(config.guildId, config)
			console.log(`[CONFIG_STORE] 🎯 Cache updated for guild ${config.guildId}`)
			return true
		} catch (error) {
			console.error(
				`[CONFIG_STORE] ❌ Error saving config for guild ${config.guildId}:`,
				error,
			)
			return false
		}
	}

	public async createDefaultConfig(
		guildId: string,
		setupBy: string,
		guildName: string,
	): Promise<GuildConfig> {
		const defaultConfig: GuildConfig = {
			guildId,
			botName: "MoniBot",
			timezone: "UTC",
			language: "es",
			allowedRoles: new Map(),
			adminRoles: [],
			moderatorRoles: [],
			channels: {},
			features: {
				enableSystemCommands: true,
				enableMaintenance: true,
				enableStatusUpdates: false,
				autoRestartOnError: false,
			},
			serverInfo: {
				name: guildName,
				memberCount: 0,
				lastSeen: new Date(),
			},
			isConfigured: false,
			setupBy,
			lastModified: new Date(),
		}

		await this.saveConfig(defaultConfig)
		return defaultConfig
	}

	public async updateServerInfo(
		guildId: string,
		name: string,
		memberCount: number,
	): Promise<void> {
		try {
			await GuildConfigModel.findOneAndUpdate(
				{ guildId },
				{
					"serverInfo.name": name,
					"serverInfo.memberCount": memberCount,
					"serverInfo.lastSeen": new Date(),
				},
			)

			// Update cache if exists
			const cached = this.cache.get(guildId)
			if (cached) {
				cached.serverInfo.name = name
				cached.serverInfo.memberCount = memberCount
				cached.serverInfo.lastSeen = new Date()
			}
		} catch (error) {
			console.error(`Error updating server info for guild ${guildId}:`, error)
		}
	}

	public clearCache(guildId?: string): void {
		if (guildId) {
			this.cache.delete(guildId)
		} else {
			this.cache.clear()
		}
	}

	public async isConfigured(guildId: string): Promise<boolean> {
		const config = await this.getConfig(guildId)
		return config?.isConfigured || false
	}
}
