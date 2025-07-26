import { DiscordBot } from "./bot"
import { CONFIG } from "./config/config.service"

// Main function
async function main(): Promise<void> {
	console.log("[MAIN] 🚀 Iniciando MoniBot...")

	// CONFIG service automatically validates environment variables on initialization
	console.log(
		`[MAIN] 🔧 Configuración cargada para entorno: ${CONFIG.get("NODE_ENV")}`,
	)

	// Create and start the bot
	const bot = new DiscordBot()

	// Graceful shutdown handlers
	const shutdown = async (signal: string) => {
		console.log(`\n[MAIN] 📡 Señal ${signal} recibida. Cerrando bot...`)
		await bot.stop()
		process.exit(0)
	}

	process.on("SIGTERM", () => shutdown("SIGTERM"))
	process.on("SIGINT", () => shutdown("SIGINT"))

	// Handle uncaught exceptions
	process.on("uncaughtException", (error) => {
		console.error("[MAIN] ❌ Excepción no manejada:", error)
		shutdown("UNCAUGHT_EXCEPTION")
	})

	process.on("unhandledRejection", (reason) => {
		console.error("[MAIN] ❌ Promesa rechazada no manejada:", reason)
		shutdown("UNHANDLED_REJECTION")
	})

	// Start the bot
	try {
		await bot.start()
	} catch (error) {
		console.error("[MAIN] ❌ Error fatal iniciando el bot:", error)
		process.exit(1)
	}
}

// Run the application
main().catch((error) => {
	console.error("[MAIN] ❌ Error fatal en main():", error)
	process.exit(1)
})
