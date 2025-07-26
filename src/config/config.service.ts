interface AppConfig {
	DISCORD_TOKEN: string
	DISCORD_CLIENT_ID: string
	MONGO_URI: string
	NODE_ENV: "development" | "production" | "test"
	LOG_LEVEL: "debug" | "info" | "warn" | "error"
}

class ConfigService {
	private static instance: ConfigService
	private config: AppConfig

	private constructor() {
		console.log("[CONFIG] 🔧 Initializing configuration service...")
		this.config = this.loadConfig()
		console.log(
			`[CONFIG] ✅ Configuration loaded successfully - Environment: ${this.config.NODE_ENV}, Log Level: ${this.config.LOG_LEVEL}`,
		)
	}

	public static getInstance(): ConfigService {
		if (!ConfigService.instance) {
			ConfigService.instance = new ConfigService()
		}
		return ConfigService.instance
	}

	private loadConfig(): AppConfig {
		const requiredEnvVars = ["DISCORD_TOKEN", "DISCORD_CLIENT_ID", "MONGO_URI"]
		const missingVars: string[] = []

		for (const envVar of requiredEnvVars) {
			if (!process.env[envVar]) {
				missingVars.push(envVar)
			}
		}

		if (missingVars.length > 0) {
			console.error(
				`[CONFIG] ❌ Missing required environment variables: ${missingVars.join(", ")}`,
			)
			throw new Error(
				`Missing required environment variables: ${missingVars.join(", ")}`,
			)
		}

		return {
			DISCORD_TOKEN: process.env.DISCORD_TOKEN as string,
			DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID as string,
			MONGO_URI: process.env.MONGO_URI as string,
			NODE_ENV:
				(process.env.NODE_ENV as AppConfig["NODE_ENV"]) || "development",
			LOG_LEVEL: (process.env.LOG_LEVEL as AppConfig["LOG_LEVEL"]) || "info",
		}
	}

	public get<K extends keyof AppConfig>(key: K): AppConfig[K] {
		return this.config[key]
	}

	public getAll(): Readonly<AppConfig> {
		return { ...this.config }
	}

	public isDevelopment(): boolean {
		return this.config.NODE_ENV === "development"
	}

	public isProduction(): boolean {
		return this.config.NODE_ENV === "production"
	}

	public isTest(): boolean {
		return this.config.NODE_ENV === "test"
	}
}

// Export singleton instance
export const CONFIG = ConfigService.getInstance()
