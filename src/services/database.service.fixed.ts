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
		return this.isConnected && mongoose.connection.readyState === 1
	}

	public async connect(): Promise<void> {
		if (this.isConnected) {
			return
		}

		const mongoUri = CONFIG.get("MONGO_URI")

		try {
			await mongoose.connect(mongoUri)
			this.isConnected = true
			console.log("✅ Connected to MongoDB")

			// Handle connection events
			mongoose.connection.on("error", (error) => {
				console.error("MongoDB connection error:", error)
				this.isConnected = false
			})

			mongoose.connection.on("disconnected", () => {
				console.warn("MongoDB disconnected")
				this.isConnected = false
			})

			mongoose.connection.on("reconnected", () => {
				console.log("MongoDB reconnected")
				this.isConnected = true
			})
		} catch (error) {
			console.error("Failed to connect to MongoDB:", error)
			this.isConnected = false
			throw error
		}
	}

	public async disconnect(): Promise<void> {
		if (!this.isConnected) {
			return
		}

		try {
			await mongoose.disconnect()
			this.isConnected = false
			console.log("✅ Disconnected from MongoDB")
		} catch (error) {
			console.error("Error disconnecting from MongoDB:", error)
			throw error
		}
	}

	public async healthCheck(): Promise<{ status: string; latency: number }> {
		const start = Date.now()

		try {
			await mongoose.connection.db?.admin().ping()
			const latency = Date.now() - start

			return {
				status: this.isConnected ? "connected" : "disconnected",
				latency,
			}
		} catch (_error) {
			return {
				status: "error",
				latency: Date.now() - start,
			}
		}
	}
}
