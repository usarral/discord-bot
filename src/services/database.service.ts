import mongoose from "mongoose"
import { CONFIG } from "../config/config.service"

export class DatabaseService {
	private static instance: DatabaseService
	private isConnected = false

	private constructor() {}

	public static getInstance(): DatabaseService {
		if (!DatabaseService.instance) {
			DatabaseService.instance = new DatabaseService()
		}
		return DatabaseService.instance
	}

	public getConnectionStatus(): boolean {
		const isConnected = this.isConnected && mongoose.connection.readyState === 1

		console.log(
			`[DATABASE] 📊 Connection status check - Internal flag: ${this.isConnected}, Mongoose state: ${mongoose.connection.readyState}, Final status: ${isConnected}`,
		)

		return isConnected
	}

	public async connect(): Promise<void> {
		if (this.isConnected) {
			console.log("[DATABASE] 🔗 Already connected to MongoDB")
			return
		}

		const mongoUri = CONFIG.get("MONGO_URI")
		const dbName = mongoUri.split("/").pop()?.split("?")[0] || "unknown"

		console.log(`[DATABASE] 🔄 Connecting to MongoDB database: ${dbName}`)

		try {
			await mongoose.connect(mongoUri)
			this.isConnected = true
			console.log(`[DATABASE] ✅ Connected to MongoDB - Database: ${dbName}`)
			console.log(
				`[DATABASE] 📊 Connection state: ${mongoose.connection.readyState} (1=connected)`,
			)

			// Handle connection events
			mongoose.connection.on("error", (error) => {
				console.error("[DATABASE] ❌ MongoDB connection error:", error)
				this.isConnected = false
			})

			mongoose.connection.on("disconnected", () => {
				console.warn("[DATABASE] ⚠️ MongoDB disconnected")
				this.isConnected = false
			})

			mongoose.connection.on("reconnected", () => {
				console.log("[DATABASE] 🔄 MongoDB reconnected")
				this.isConnected = true
			})
		} catch (error) {
			console.error(
				`[DATABASE] ❌ Failed to connect to MongoDB database: ${dbName}`,
				error,
			)
			this.isConnected = false
			throw error
		}
	}

	public async disconnect(): Promise<void> {
		if (!this.isConnected) {
			console.log("[DATABASE] 🔗 Already disconnected from MongoDB")
			return
		}

		console.log("[DATABASE] 🔄 Disconnecting from MongoDB...")

		try {
			await mongoose.disconnect()
			this.isConnected = false
			console.log("[DATABASE] ✅ Disconnected from MongoDB")
		} catch (error) {
			console.error("[DATABASE] ❌ Error disconnecting from MongoDB:", error)
			throw error
		}
	}

	public async healthCheck(): Promise<{ status: string; latency: number }> {
		const start = Date.now()

		try {
			// Check if connection exists before pinging
			if (!mongoose.connection.db) {
				throw new Error("Database connection not established")
			}

			await mongoose.connection.db.admin().ping()
			const latency = Date.now() - start
			const connectionState = mongoose.connection.readyState

			console.log(
				`[DATABASE] 🏥 Health check completed - Status: connected, Latency: ${latency}ms, ReadyState: ${connectionState}`,
			)

			return {
				status: this.isConnected ? "connected" : "disconnected",
				latency,
			}
		} catch (error) {
			const latency = Date.now() - start
			const connectionState = mongoose.connection.readyState

			console.error(
				`[DATABASE] ❌ Health check failed - Status: error, Latency: ${latency}ms, ReadyState: ${connectionState}`,
			)
			console.error("[DATABASE] 🔍 Error details:", error)

			return {
				status: "error",
				latency,
			}
		}
	}
}
