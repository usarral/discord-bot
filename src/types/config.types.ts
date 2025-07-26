export interface GuildConfig {
	guildId: string
	botName: string
	timezone: string
	language: "es" | "en"

	allowedRoles: Map<string, string[]> // comando -> array de role IDs
	adminRoles: string[]
	moderatorRoles: string[]

	channels: {
		logs?: string
		announcements?: string
		status?: string
	}

	features: {
		enableSystemCommands: boolean
		enableMaintenance: boolean
		enableStatusUpdates: boolean
		autoRestartOnError: boolean
	}

	serverInfo: {
		name: string
		memberCount: number
		lastSeen: Date
	}

	isConfigured: boolean
	setupBy: string
	lastModified: Date
}

export interface SystemInfo {
	cpu: string
	memory: string
	disk: string
	uptime: string
	platform: NodeJS.Platform
}

export interface SetupSteps {
	basic: boolean
	roles: boolean
	channels: boolean
	features: boolean
}
