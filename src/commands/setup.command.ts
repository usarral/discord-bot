import {
	ActionRowBuilder,
	ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	type ChatInputCommandInteraction,
	ComponentType,
	EmbedBuilder,
	ModalBuilder,
	type ModalSubmitInteraction,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	type StringSelectMenuInteraction,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js"
import { ConfigStore } from "../storage/config.store"
import { BaseCommand } from "./base.command"

export class SetupCommand extends BaseCommand {
	public name = "setup"
	public builder = new SlashCommandBuilder()
		.setName("setup")
		.setDescription(
			"Configura el bot para este servidor usando un asistente interactivo",
		)

	// Setup requires configuration permissions but handled in executeCommand
	protected requiresPermissions = false
	private configStore = new ConfigStore()

	public async executeCommand(
		interaction: ChatInputCommandInteraction,
	): Promise<void> {
		console.log(
			`[SETUP] 🚀 Setup command initiated by ${interaction.user.tag} in guild ${interaction.guild?.name}`,
		)

		// Check configuration permissions specifically
		const hasConfigPerms = await this.checkConfigurationPermissions(interaction)
		if (!hasConfigPerms) {
			console.log(`[SETUP] ❌ Permission denied for ${interaction.user.tag}`)
			return
		}

		if (!interaction.guild) {
			console.log("[SETUP] ❌ No guild context")
			return
		}

		const guildId = interaction.guild.id
		console.log(`[SETUP] 📊 Checking existing config for guild ${guildId}`)

		const existingConfig = await this.configStore.getConfig(guildId)
		console.log(
			`[SETUP] 📋 Existing config:`,
			existingConfig?.isConfigured ? "Found" : "Not found",
		)

		if (existingConfig?.isConfigured) {
			// Bot is already configured, ask if they want to reconfigure
			const embed = new EmbedBuilder()
				.setTitle("🔧 Bot ya configurado")
				.setDescription(
					"El bot ya está configurado en este servidor. ¿Deseas reconfigurarlo?",
				)
				.setColor(0xffa500)
				.addFields(
					{
						name: "Configurado por",
						value: `<@${existingConfig.setupBy}>`,
						inline: true,
					},
					{
						name: "Fecha",
						value: existingConfig.lastModified.toLocaleDateString("es-ES"),
						inline: true,
					},
				)

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId("reconfigure_yes")
					.setLabel("Sí, reconfigurar")
					.setStyle(ButtonStyle.Primary)
					.setEmoji("🔄"),
				new ButtonBuilder()
					.setCustomId("reconfigure_no")
					.setLabel("No, cancelar")
					.setStyle(ButtonStyle.Secondary)
					.setEmoji("❌"),
			)

			const response = await interaction.reply({
				embeds: [embed],
				components: [row],
				ephemeral: true,
			})

			try {
				const confirmation = await response.awaitMessageComponent({
					componentType: ComponentType.Button,
					time: 30000,
				})

				console.log(
					`[SETUP] 🔄 Reconfiguration choice: ${confirmation.customId}`,
				)

				if (confirmation.customId === "reconfigure_no") {
					console.log("[SETUP] ❌ User cancelled reconfiguration")
					await confirmation.update({
						content: "✅ Configuración cancelada.",
						embeds: [],
						components: [],
					})
					return
				}

				// Continue with reconfiguration
				console.log("[SETUP] 🔄 Starting reconfiguration process")
				await confirmation.update({
					content: "🔄 Iniciando reconfiguración...",
					embeds: [],
					components: [],
				})

				await this.startSetupProcess(confirmation, true)
			} catch (error) {
				console.log("[SETUP] ⏰ Reconfiguration timeout or error:", error)
				await interaction.editReply({
					content: "⏰ Tiempo de respuesta agotado. Configuración cancelada.",
					embeds: [],
					components: [],
				})
			}
		} else {
			// First time setup
			console.log("[SETUP] 🆕 Starting first-time setup")
			await this.startSetupProcess(interaction, false)
		}
	}

	private async startSetupProcess(
		interaction: ChatInputCommandInteraction | ButtonInteraction,
		isReconfiguration: boolean,
	): Promise<void> {
		console.log(
			`[SETUP] 🎬 Starting setup process (reconfiguration: ${isReconfiguration})`,
		)

		const embed = new EmbedBuilder()
			.setTitle("🚀 Configuración del Bot")
			.setDescription(
				isReconfiguration
					? "Vamos a reconfigurar el bot paso a paso."
					: "Te guiaré través del proceso de configuración paso a paso.",
			)
			.setColor(0x00ff00)
			.addFields({
				name: "📋 Pasos",
				value:
					"1️⃣ Información básica\n2️⃣ Configuración de roles\n3️⃣ Canales del bot\n4️⃣ Características",
				inline: false,
			})

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("setup_start")
				.setLabel("Comenzar configuración")
				.setStyle(ButtonStyle.Primary)
				.setEmoji("▶️"),
		)

		const response = await interaction[
			isReconfiguration ? "followUp" : "reply"
		]({
			embeds: [embed],
			components: [row],
			ephemeral: true,
		})

		try {
			const startConfirmation = await response.awaitMessageComponent({
				componentType: ComponentType.Button,
				time: 60000,
			})

			console.log("[SETUP] ✅ User confirmed to start setup")
			await this.showTimezoneSelector(startConfirmation)
		} catch (error) {
			console.log("[SETUP] ⏰ Setup start timeout or error:", error)
			await interaction.editReply({
				content: "⏰ Tiempo de respuesta agotado. Configuración cancelada.",
				embeds: [],
				components: [],
			})
		}
	}

	private async showTimezoneSelector(
		interaction: ButtonInteraction,
	): Promise<void> {
		console.log("[SETUP] 🕐 Showing timezone selector")

		const embed = new EmbedBuilder()
			.setTitle("🕐 Selecciona la zona horaria")
			.setDescription("Elige la zona horaria principal de tu servidor:")
			.setColor(0x0099ff)

		const timezoneSelect = new StringSelectMenuBuilder()
			.setCustomId("setup_timezone")
			.setPlaceholder("Selecciona una zona horaria...")
			.addOptions([
				{
					label: "🇪🇸 Madrid (Europe/Madrid)",
					value: "Europe/Madrid",
					description: "UTC+1/+2 - España Peninsula y Baleares",
				},
				{
					label: "🇮🇨 Canarias (Atlantic/Canary)",
					value: "Atlantic/Canary",
					description: "UTC+0/+1 - Islas Canarias",
				},
				{
					label: "🇲🇽 México Central (America/Mexico_City)",
					value: "America/Mexico_City",
					description: "UTC-6/-5 - Ciudad de México",
				},
				{
					label: "🇦🇷 Buenos Aires (America/Argentina/Buenos_Aires)",
					value: "America/Argentina/Buenos_Aires",
					description: "UTC-3 - Argentina",
				},
				{
					label: "🇨🇴 Bogotá (America/Bogota)",
					value: "America/Bogota",
					description: "UTC-5 - Colombia",
				},
				{
					label: "🇺🇸 Nueva York (America/New_York)",
					value: "America/New_York",
					description: "UTC-5/-4 - Costa Este USA",
				},
				{
					label: "🌍 UTC (Coordinated Universal Time)",
					value: "UTC",
					description: "UTC+0 - Tiempo universal",
				},
			])

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			timezoneSelect,
		)

		await interaction.update({
			embeds: [embed],
			components: [row],
		})
	}

	private async showLanguageSelector(
		interaction: StringSelectMenuInteraction,
		timezone: string,
	): Promise<void> {
		console.log(`[SETUP] 🌐 Showing language selector (timezone: ${timezone})`)

		const embed = new EmbedBuilder()
			.setTitle("🌐 Selecciona el idioma")
			.setDescription("Elige el idioma principal del bot:")
			.setColor(0x0099ff)
			.addFields({
				name: "✅ Zona horaria seleccionada",
				value: timezone,
				inline: true,
			})

		const languageSelect = new StringSelectMenuBuilder()
			.setCustomId(`setup_language_${timezone}`)
			.setPlaceholder("Selecciona un idioma...")
			.addOptions([
				{
					label: "🇪🇸 Español",
					value: "es",
					description: "Mensajes en español",
					emoji: "🇪🇸",
				},
				{
					label: "🇺🇸 English",
					value: "en",
					description: "Messages in English",
					emoji: "🇺🇸",
				},
			])

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			languageSelect,
		)

		await interaction.update({
			embeds: [embed],
			components: [row],
		})
	}

	private async showBotNameModal(
		interaction: StringSelectMenuInteraction,
		timezone: string,
		language: string,
	): Promise<void> {
		console.log(
			`[SETUP] 🤖 Showing bot name modal (timezone: ${timezone}, language: ${language})`,
		)

		if (!interaction.guild) return

		const guildId = interaction.guild.id
		const existingConfig = await this.configStore.getConfig(guildId)

		const modal = new ModalBuilder()
			.setCustomId(`setup_botname_${timezone}_${language}`)
			.setTitle("Nombre del Bot")

		const botNameInput = new TextInputBuilder()
			.setCustomId("bot_name")
			.setLabel("¿Cómo quieres llamar al bot?")
			.setStyle(TextInputStyle.Short)
			.setPlaceholder("MoniBot, Asistente, Helper...")
			.setValue(existingConfig?.botName || "MoniBot")
			.setRequired(true)
			.setMaxLength(50)

		const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
			botNameInput,
		)

		modal.addComponents(firstRow)

		console.log("[SETUP] 📝 Showing bot name modal")
		await interaction.showModal(modal)
	}

	public async handleModalSubmit(
		interaction: ModalSubmitInteraction,
	): Promise<void> {
		console.log(`[SETUP] 📝 Modal submitted: ${interaction.customId}`)

		if (interaction.customId.startsWith("setup_botname_")) {
			await this.handleBotNameSubmit(interaction)
		}
	}

	public async handleSelectMenu(
		interaction: StringSelectMenuInteraction,
	): Promise<void> {
		console.log(`[SETUP] 📋 Select menu interaction: ${interaction.customId}`)

		if (interaction.customId === "setup_timezone") {
			await this.showLanguageSelector(interaction, interaction.values[0])
		} else if (interaction.customId.startsWith("setup_language_")) {
			const timezone = interaction.customId.replace("setup_language_", "")
			await this.showBotNameModal(interaction, timezone, interaction.values[0])
		}
	}

	private async handleBotNameSubmit(
		interaction: ModalSubmitInteraction,
	): Promise<void> {
		console.log("[SETUP] 🤖 Processing bot name submission")

		if (!interaction.guild) return

		const customIdParts = interaction.customId.split("_")
		const timezone = customIdParts[2]
		const language = customIdParts[3]
		const botName = interaction.fields.getTextInputValue("bot_name")

		console.log(
			`[SETUP] 💾 Saving config: name=${botName}, timezone=${timezone}, language=${language}`,
		)

		const guildId = interaction.guild.id
		let config = await this.configStore.getConfig(guildId)

		if (!config) {
			console.log("[SETUP] 🆕 Creating new config")
			config = await this.configStore.createDefaultConfig(
				guildId,
				interaction.user.id,
				interaction.guild.name,
			)
		}

		config.botName = botName
		config.timezone = timezone
		config.language = language as "es" | "en"
		config.isConfigured = true

		try {
			await this.configStore.saveConfig(config)
			console.log("[SETUP] ✅ Configuration saved successfully")

			// Intentar actualizar el nickname del bot
			await this.updateBotNickname(interaction, botName)

			const embed = new EmbedBuilder()
				.setTitle("✅ Configuración Básica Completada")
				.setDescription("La información básica ha sido guardada correctamente.")
				.setColor(0x00ff00)
				.addFields(
					{
						name: "🤖 Nombre del Bot",
						value: botName,
						inline: true,
					},
					{
						name: "🕐 Zona Horaria",
						value: timezone,
						inline: true,
					},
					{
						name: "🌐 Idioma",
						value: language === "es" ? "🇪🇸 Español" : "🇺🇸 English",
						inline: true,
					},
				)
				.setFooter({
					text: "Configuración básica completa. Puedes usar /setup para más opciones.",
				})

			await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			})
		} catch (error) {
			console.error("[SETUP] ❌ Error saving configuration:", error)
			await interaction.reply({
				content: "❌ Error al guardar la configuración. Inténtalo de nuevo.",
				ephemeral: true,
			})
		}
	}

	/**
	 * Actualiza el nickname del bot en el servidor
	 */
	private async updateBotNickname(
		interaction: ModalSubmitInteraction,
		botName: string,
	): Promise<void> {
		try {
			if (!interaction.guild) return

			console.log(`[SETUP] 🤖 Attempting to update bot nickname to: ${botName}`)

			const botMember = interaction.guild.members.me
			if (!botMember) {
				console.log("[SETUP] ❌ Bot member not found in guild")
				return
			}

			// Verificar permisos
			if (!botMember.permissions.has("ChangeNickname")) {
				console.log("[SETUP] ⚠️ Bot doesn't have permission to change nickname")
				return
			}

			// Cambiar el nickname
			await botMember.setNickname(botName, "Configuración del bot actualizada")
			console.log(`[SETUP] ✅ Bot nickname updated to: ${botName}`)
		} catch (error) {
			console.error("[SETUP] ❌ Error updating bot nickname:", error)
			// No fallar la configuración por esto, solo loguearlo
		}
	}
}
