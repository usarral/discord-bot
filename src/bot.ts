import { Client, Collection, GatewayIntentBits, REST, Routes } from "discord.js"
import type { BaseCommand } from "./commands/base.command"
import { BotInfoCommand } from "./commands/botinfo.command"
import { ConfigCommand } from "./commands/config.command"
import { PermissionsCommand } from "./commands/permissions.command"
import { RebootCommand } from "./commands/reboot.command"
import { SetNameCommand } from "./commands/setname.command"
// Import commands
import { SetupCommand } from "./commands/setup.command"
import { StatusCommand } from "./commands/status.command"
import { TestDbCommand } from "./commands/testdb.command"
import { CONFIG } from "./config/config.service"
import { BotManagementService } from "./services/bot-management.service"
import { DatabaseService } from "./services/database.service"

export class DiscordBot {
	private client: Client
	private commands: Collection<string, BaseCommand>
	private databaseService: DatabaseService
	private botManagementService: BotManagementService

	constructor() {
		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
			],
		})

		this.commands = new Collection()
		this.databaseService = DatabaseService.getInstance()
		this.botManagementService = new BotManagementService()

		this.setupEventHandlers()
		this.loadCommands()
	}

	private loadCommands(): void {
		const commands = [
			new SetupCommand(),
			new SetNameCommand(),
			new BotInfoCommand(),
			new StatusCommand(),
			new RebootCommand(),
			new PermissionsCommand(),
			new TestDbCommand(),
			new ConfigCommand(),
		]

		for (const command of commands) {
			this.commands.set(command.name, command)
		}

		console.log(`[BOT] ✅ Loaded ${commands.length} commands successfully`)
	}

	private setupEventHandlers(): void {
		this.client.once("ready", async () => {
			console.log(`[BOT] 🤖 Bot logged in as ${this.client.user?.tag}`)

			// Update nicknames in all guilds
			console.log(
				`[BOT] 🔄 Updating bot nicknames in ${this.client.guilds.cache.size} guilds...`,
			)
			for (const guild of this.client.guilds.cache.values()) {
				await this.botManagementService.updateBotNickname(guild)
			}

			this.registerSlashCommands()
		})

		// When bot joins a new guild
		this.client.on("guildCreate", async (guild) => {
			console.log(`[BOT] ➕ Bot joined new guild: ${guild.name} (${guild.id})`)
			await this.botManagementService.updateBotNickname(guild)
		})

		this.client.on("interactionCreate", async (interaction) => {
			try {
				if (interaction.isChatInputCommand()) {
					// Handle slash commands
					const command = this.commands.get(interaction.commandName)
					if (!command) return

					await command.execute(interaction)
				} else if (interaction.isModalSubmit()) {
					// Handle modal submissions
					console.log(`[BOT] 📝 Modal submit: ${interaction.customId}`)

					if (interaction.customId.startsWith("setup_")) {
						const setupCommand = this.commands.get("setup") as SetupCommand
						await setupCommand?.handleModalSubmit?.(interaction)
					} else if (interaction.customId === "setname_modal") {
						const setNameCommand = this.commands.get(
							"setname",
						) as SetNameCommand
						await setNameCommand?.handleModalSubmit?.(interaction)
					}
				} else if (interaction.isStringSelectMenu()) {
					// Handle select menu interactions
					console.log(`[BOT] 📋 Select menu: ${interaction.customId}`)

					if (interaction.customId.startsWith("setup_")) {
						const setupCommand = this.commands.get("setup") as SetupCommand
						await setupCommand?.handleSelectMenu?.(interaction)
					}
				}
			} catch (error) {
				console.error(
					`[BOT] ❌ Error handling interaction ${interaction.type}:`,
					error,
				)

				const errorMessage = {
					content: "❌ Hubo un error al procesar esta interacción.",
					ephemeral: true,
				}

				try {
					if (interaction.isRepliable()) {
						if (interaction.replied || interaction.deferred) {
							await interaction.followUp(errorMessage)
						} else {
							await interaction.reply(errorMessage)
						}
					}
				} catch (replyError) {
					console.error("[BOT] ❌ Error sending error message:", replyError)
				}
			}
		})

		this.client.on("error", (error) => {
			console.error("Discord client error:", error)
		})

		this.client.on("warn", (warning) => {
			console.warn("[BOT] ⚠️ Discord client warning:", warning)
		})
	}

	private async registerSlashCommands(): Promise<void> {
		try {
			const rest = new REST().setToken(CONFIG.get("DISCORD_TOKEN"))

			const commandData = Array.from(this.commands.values()).map((command) =>
				command.builder.toJSON(),
			)

			console.log("[BOT] 🔄 Registering slash commands...")

			const data = (await rest.put(
				Routes.applicationCommands(CONFIG.get("DISCORD_CLIENT_ID")),
				{ body: commandData },
			)) as unknown[]

			console.log(
				`[BOT] ✅ Successfully registered ${data.length} slash commands`,
			)
		} catch (error) {
			console.error("[BOT] ❌ Error registering slash commands:", error)
		}
	}

	public async start(): Promise<void> {
		try {
			console.log("[BOT] 🚀 Starting Discord bot...")

			// Connect to database first
			await this.databaseService.connect()

			// Then login to Discord
			await this.client.login(CONFIG.get("DISCORD_TOKEN"))
		} catch (error) {
			console.error("[BOT] ❌ Failed to start bot:", error)
			process.exit(1)
		}
	}

	public async stop(): Promise<void> {
		console.log("[BOT] 🛑 Shutting down bot...")

		try {
			await this.databaseService.disconnect()
			this.client.destroy()
			console.log("[BOT] ✅ Bot shut down successfully")
		} catch (error) {
			console.error("[BOT] ❌ Error during shutdown:", error)
		}
	}
}
