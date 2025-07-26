import { type Document, model, Schema } from "mongoose"
import type { GuildConfig } from "../types/config.types.js"

export interface IGuildConfig extends Document, Omit<GuildConfig, "_id"> {}

const guildConfigSchema = new Schema<IGuildConfig>(
	{
		guildId: { type: String, required: true, unique: true },
		botName: { type: String, required: true, default: "MoniBot" },
		timezone: { type: String, required: true, default: "UTC" },
		language: { type: String, enum: ["es", "en"], default: "es" },

		allowedRoles: {
			type: Map,
			of: [String],
			default: new Map(),
		},
		adminRoles: { type: [String], default: [] },
		moderatorRoles: { type: [String], default: [] },

		channels: {
			logs: { type: String, required: false },
			announcements: { type: String, required: false },
			status: { type: String, required: false },
		},

		features: {
			enableSystemCommands: { type: Boolean, default: true },
			enableMaintenance: { type: Boolean, default: true },
			enableStatusUpdates: { type: Boolean, default: false },
			autoRestartOnError: { type: Boolean, default: false },
		},

		serverInfo: {
			name: { type: String, required: true },
			memberCount: { type: Number, default: 0 },
			lastSeen: { type: Date, default: Date.now },
		},

		isConfigured: { type: Boolean, default: false },
		setupBy: { type: String, required: true },
		lastModified: { type: Date, default: Date.now },
	},
	{
		timestamps: true,
	},
)

export const GuildConfigModel = model<IGuildConfig>(
	"GuildConfig",
	guildConfigSchema,
)
