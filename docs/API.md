# 📚 API Reference - MoniBot

## Core Services

### DatabaseService

#### `getInstance(): DatabaseService`
Obtiene la instancia singleton del servicio de base de datos.

```typescript
const db = DatabaseService.getInstance()
```

#### `connect(): Promise<void>`
Establece conexión con MongoDB y configura event listeners.

```typescript
await db.connect()
```

**Throws:** Error si falla la conexión o las credenciales son inválidas.

#### `disconnect(): Promise<void>`
Cierra la conexión con MongoDB de forma segura.

```typescript
await db.disconnect()
```

#### `getConnectionStatus(): boolean`
Verifica el estado actual de la conexión.

```typescript
const isConnected = db.getConnectionStatus()
// Returns: true si conectado, false si no
```

#### `healthCheck(): Promise<{ status: string; latency: number }>`
Realiza un ping a la base de datos y mide la latencia.

```typescript
const health = await db.healthCheck()
// Returns: { status: "connected" | "disconnected" | "error", latency: number }
```

---

### ConfigService

#### `getInstance(): ConfigService`
Obtiene la instancia singleton del servicio de configuración.

```typescript
const config = ConfigService.getInstance()
// También disponible como: CONFIG
```

#### `get<K extends keyof AppConfig>(key: K): AppConfig[K]`
Obtiene una variable de configuración específica.

```typescript
const token = CONFIG.get("DISCORD_TOKEN")
const clientId = CONFIG.get("DISCORD_CLIENT_ID")
const mongoUri = CONFIG.get("MONGO_URI")
```

#### `getAll(): Readonly<AppConfig>`
Obtiene toda la configuración (solo lectura).

```typescript
const allConfig = CONFIG.getAll()
```

#### Environment Helpers
```typescript
CONFIG.isDevelopment(): boolean  // NODE_ENV === "development"
CONFIG.isProduction(): boolean   // NODE_ENV === "production"  
CONFIG.isTest(): boolean         // NODE_ENV === "test"
```

**AppConfig Interface:**
```typescript
interface AppConfig {
    DISCORD_TOKEN: string
    DISCORD_CLIENT_ID: string
    MONGO_URI: string
    NODE_ENV: "development" | "production" | "test"
    LOG_LEVEL: "debug" | "info" | "warn" | "error"
}
```

---

### BotManagementService

#### `updateBotNickname(guild: Guild): Promise<boolean>`
Actualiza el nickname del bot en un servidor según la configuración almacenada.

```typescript
const botMgmt = new BotManagementService()
const success = await botMgmt.updateBotNickname(guild)
```

**Returns:** `true` si se actualizó exitosamente, `false` si no.

---

### PermissionService

#### `hasPermission(userId: string, guildId: string, permission: string): Promise<boolean>`
Verifica si un usuario tiene un permiso específico en un servidor.

```typescript
const permService = new PermissionService()
const canReboot = await permService.hasPermission(userId, guildId, "reboot")
```

#### `getUserPermissions(userId: string, guildId: string): Promise<string[]>`
Obtiene todos los permisos de un usuario en un servidor.

```typescript
const permissions = await permService.getUserPermissions(userId, guildId)
// Returns: ["setup", "reboot", "status", ...]
```

---

## Storage Layer

### ConfigStore

#### `getConfig(guildId: string): Promise<IGuildConfig | null>`
Obtiene la configuración de un servidor específico.

```typescript
const configStore = new ConfigStore()
const config = await configStore.getConfig("123456789")
```

#### `saveConfig(guildId: string, config: Partial<IGuildConfig>): Promise<IGuildConfig>`
Guarda o actualiza la configuración de un servidor.

```typescript
const newConfig = await configStore.saveConfig("123456789", {
    botName: "MiBot",
    timezone: "America/Mexico_City"
})
```

#### `deleteConfig(guildId: string): Promise<boolean>`
Elimina la configuración de un servidor.

```typescript
const deleted = await configStore.deleteConfig("123456789")
```

**IGuildConfig Interface:**
```typescript
interface IGuildConfig {
    guildId: string
    botName?: string
    timezone?: string
    adminRoles?: string[]
    moderatorRoles?: string[]
    allowedChannels?: string[]
    statusChannel?: string
    logChannel?: string
    features?: {
        autoNickname?: boolean
        systemMonitoring?: boolean
        autoRestart?: boolean
    }
    permissions?: {
        [userId: string]: string[]
    }
    createdAt: Date
    updatedAt: Date
}
```

---

## Command System

### BaseCommand (Abstract)

Clase base que deben extender todos los comandos.

#### Properties
```typescript
public abstract name: string                    // Nombre del comando
public abstract builder: SlashCommandBuilder   // Constructor del comando slash
protected requiresPermissions: boolean = true  // Si requiere verificación de permisos
```

#### Methods

##### `execute(interaction: ChatInputCommandInteraction): Promise<void>`
Método principal que maneja la ejecución del comando.

```typescript
public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Verificación automática de permisos si requiresPermissions = true
    // Llama a executeCommand() para la lógica específica
}
```

##### `executeCommand(interaction: ChatInputCommandInteraction): Promise<void>`
Método abstracto que debe implementar cada comando específico.

```typescript
public abstract async executeCommand(interaction: ChatInputCommandInteraction): Promise<void>
```

##### `checkPermissions(interaction: ChatInputCommandInteraction): Promise<boolean>`
Verifica si el usuario tiene permisos para ejecutar el comando.

```typescript
const hasPermission = await this.checkPermissions(interaction)
```

##### `checkConfigurationPermissions(interaction: ChatInputCommandInteraction): Promise<boolean>`
Verifica permisos específicos para comandos de configuración.

```typescript
const canConfigure = await this.checkConfigurationPermissions(interaction)
```

##### `handleError(interaction: ChatInputCommandInteraction, error: unknown): Promise<void>`
Maneja errores de forma consistente.

```typescript
await this.handleError(interaction, error)
```

---

## Models

### Guild Model

#### Schema
```typescript
const GuildConfigSchema = new Schema<IGuildConfig>({
    guildId: { type: String, required: true, unique: true },
    botName: { type: String },
    timezone: { type: String, default: "UTC" },
    adminRoles: [{ type: String }],
    moderatorRoles: [{ type: String }],
    allowedChannels: [{ type: String }],
    statusChannel: { type: String },
    logChannel: { type: String },
    features: {
        autoNickname: { type: Boolean, default: true },
        systemMonitoring: { type: Boolean, default: true },
        autoRestart: { type: Boolean, default: false }
    },
    permissions: { type: Map, of: [String] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})
```

#### Usage
```typescript
import { GuildConfig } from "../models/guild.model"

// Crear nueva configuración
const config = new GuildConfig({
    guildId: "123456789",
    botName: "MiBot"
})
await config.save()

// Buscar configuración
const existing = await GuildConfig.findOne({ guildId: "123456789" })

// Actualizar configuración
await GuildConfig.updateOne(
    { guildId: "123456789" },
    { $set: { botName: "NuevoNombre" } }
)
```

---

## Bot Events

### Event Handlers

#### `ready`
Se ejecuta cuando el bot se conecta exitosamente a Discord.

```typescript
this.client.once("ready", async () => {
    console.log(`[BOT] 🤖 Bot logged in as ${this.client.user?.tag}`)
    // Actualizar nicknames en todos los servidores
    // Registrar comandos slash
})
```

#### `guildCreate`
Se ejecuta cuando el bot se une a un nuevo servidor.

```typescript
this.client.on("guildCreate", async (guild) => {
    console.log(`[BOT] ➕ Bot joined new guild: ${guild.name} (${guild.id})`)
    await this.botManagementService.updateBotNickname(guild)
})
```

#### `interactionCreate`
Maneja todas las interacciones (comandos slash, modales, select menus).

```typescript
this.client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
        // Manejar comandos slash
    } else if (interaction.isModalSubmit()) {
        // Manejar envíos de modal
    } else if (interaction.isStringSelectMenu()) {
        // Manejar select menus
    }
})
```

---

## Error Handling

### Standard Error Response
```typescript
const errorMessage = {
    content: "❌ Hubo un error al procesar esta interacción.",
    ephemeral: true
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
```

### Permission Denied Response
```typescript
await interaction.reply({
    embeds: [new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("❌ Acceso Denegado")
        .setDescription("No tienes permisos para ejecutar este comando.")
        .setFooter({ text: "Contacta a un administrador si crees que esto es un error." })
    ],
    ephemeral: true
})
```

---

## Utilities

### System Information
```typescript
// Información del sistema disponible en SystemService
interface SystemInfo {
    os: {
        platform: string
        release: string
        arch: string
        hostname: string
    }
    cpu: {
        usage: number
        cores: number
        model: string
    }
    memory: {
        total: number
        used: number
        free: number
        percentage: number
    }
    disk: {
        total: number
        used: number
        free: number
        percentage: number
    }
    uptime: {
        system: number
        process: number
    }
}
```

### Discord Embed Helpers
```typescript
// Embed estándar para respuestas exitosas
const successEmbed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle("✅ Operación Exitosa")
    .setDescription("La operación se completó correctamente.")
    .setTimestamp()

// Embed para errores
const errorEmbed = new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle("❌ Error")
    .setDescription("Ocurrió un error durante la operación.")
    .setTimestamp()

// Embed informativo
const infoEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("ℹ️ Información")
    .setDescription("Información del sistema.")
    .setTimestamp()
```

---

## Constants

### Permission Levels
```typescript
const PERMISSIONS = {
    SETUP: "setup",
    REBOOT: "reboot", 
    STATUS: "status",
    CONFIG: "config",
    PERMISSIONS: "permissions",
    BOTINFO: "botinfo"
} as const
```

### Log Prefixes
```typescript
const LOG_PREFIXES = {
    MAIN: "[MAIN]",
    BOT: "[BOT]",
    DATABASE: "[DATABASE]",
    CONFIG: "[CONFIG]",
    COMMAND: "[COMMAND]"
} as const
```

### Discord Colors
```typescript
const COLORS = {
    SUCCESS: 0x00ff00,
    ERROR: 0xff0000,
    WARNING: 0xffff00,
    INFO: 0x0099ff,
    PRIMARY: 0x5865f2
} as const
```
