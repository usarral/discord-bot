# 🛠️ Guía de Desarrollo - MoniBot

## Configuración del Entorno de Desarrollo

### Herramientas Recomendadas
- **Visual Studio Code** con las siguientes extensiones:
  - TypeScript
  - Biome (linting y formateo)
  - Discord.js Snippets
  - MongoDB for VS Code
- **MongoDB Compass** para gestión visual de la base de datos
- **Git** para control de versiones

### Scripts de Desarrollo
```bash
# Desarrollo con hot reload
pnpm dev

# Compilar TypeScript
pnpm build

# Modo watch para compilación automática
pnpm build:watch

# Linting y formateo
npx biome check src/
npx biome format src/ --write
```

## 🏗️ Arquitectura del Código

### Patrones de Diseño Utilizados

#### 1. Singleton Pattern
```typescript
// Servicios principales usan Singleton para instancia única
export class DatabaseService {
    private static instance: DatabaseService
    
    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService()
        }
        return DatabaseService.instance
    }
}
```

#### 2. Command Pattern
```typescript
// Todos los comandos extienden BaseCommand
export abstract class BaseCommand {
    public abstract name: string
    public abstract builder: SlashCommandBuilder
    public abstract executeCommand(interaction: ChatInputCommandInteraction): Promise<void>
}
```

#### 3. Factory Pattern
```typescript
// Carga automática de comandos
private loadCommands(): void {
    const commands = [
        new SetupCommand(),
        new StatusCommand(),
        // ... otros comandos
    ]
}
```

### Estructura de Servicios

#### DatabaseService
- **Propósito**: Gestión de conexión a MongoDB
- **Patrón**: Singleton
- **Características**: Health checks, reconexión automática, logs detallados

```typescript
// Ejemplo de uso
const db = DatabaseService.getInstance()
await db.connect()
const status = await db.healthCheck()
```

#### ConfigService
- **Propósito**: Gestión de variables de entorno
- **Patrón**: Singleton
- **Características**: Validación automática, tipado fuerte

```typescript
// Ejemplo de uso
const token = CONFIG.get("DISCORD_TOKEN")
const isDev = CONFIG.isDevelopment()
```

#### BotManagementService
- **Propósito**: Gestión del bot en servidores
- **Características**: Cambio de nickname, manejo de permisos

```typescript
// Ejemplo de uso
const botMgmt = new BotManagementService()
await botMgmt.updateBotNickname(guild)
```

## 📝 Convenciones de Código

### Nomenclatura
- **Clases**: PascalCase (`DatabaseService`)
- **Métodos**: camelCase (`connectToDatabase`)
- **Constantes**: UPPER_SNAKE_CASE (`DISCORD_TOKEN`)
- **Archivos**: kebab-case (`bot-management.service.ts`)

### Estructura de Archivos
```
archivo.service.ts          # Servicios de negocio
archivo.command.ts          # Comandos slash
archivo.model.ts            # Modelos de datos
archivo.store.ts            # Capa de persistencia
archivo.types.ts            # Definiciones de tipos
```

### Logs Estructurados
Cada módulo debe usar un prefijo consistente:
```typescript
console.log("[DATABASE] ✅ Connected successfully")
console.error("[BOT] ❌ Failed to process interaction")
console.warn("[CONFIG] ⚠️ Missing optional parameter")
```

Prefijos establecidos:
- `[MAIN]` - Archivo principal
- `[BOT]` - Lógica del bot
- `[DATABASE]` - Base de datos
- `[CONFIG]` - Configuración
- `[COMMAND]` - Comandos específicos

## 🔧 Creación de Nuevos Comandos

### 1. Crear el Archivo del Comando
```typescript
// src/commands/mi-comando.command.ts
import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js"
import { BaseCommand } from "./base.command"

export class MiComandoCommand extends BaseCommand {
    public name = "mi-comando"
    public builder = new SlashCommandBuilder()
        .setName("mi-comando")
        .setDescription("Descripción de mi comando")
    
    protected requiresPermissions = true // o false
    
    public async executeCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        console.log(`[MI-COMANDO] 🚀 Comando ejecutado por ${interaction.user.tag}`)
        
        try {
            // Lógica del comando aquí
            await interaction.reply({
                content: "¡Comando ejecutado exitosamente!",
                ephemeral: true
            })
        } catch (error) {
            console.error("[MI-COMANDO] ❌ Error:", error)
            await this.handleError(interaction, error)
        }
    }
}
```

### 2. Registrar el Comando
En `src/bot.ts`, agregar a la lista de comandos:
```typescript
private loadCommands(): void {
    const commands = [
        // ... comandos existentes
        new MiComandoCommand(),
    ]
}
```

### 3. Manejar Interacciones Adicionales (Opcional)
Si tu comando usa modales o select menus:
```typescript
// En la clase del comando
public async handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
    // Manejo de modal
}

public async handleSelectMenu(interaction: StringSelectMenuInteraction): Promise<void> {
    // Manejo de select menu
}

// En bot.ts, agregar el manejo correspondiente
if (interaction.customId.startsWith("mi_comando_")) {
    const miComando = this.commands.get("mi-comando") as MiComandoCommand
    await miComando?.handleModalSubmit?.(interaction)
}
```

## 🗄️ Trabajo con Base de Datos

### Definir un Nuevo Modelo
```typescript
// src/models/mi-modelo.model.ts
import mongoose, { type Document, Schema } from "mongoose"

export interface IMiModelo extends Document {
    guildId: string
    campo1: string
    campo2: number
    createdAt: Date
}

const MiModeloSchema = new Schema<IMiModelo>({
    guildId: { type: String, required: true, unique: true },
    campo1: { type: String, required: true },
    campo2: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
})

export const MiModelo = mongoose.model<IMiModelo>("MiModelo", MiModeloSchema)
```

### Usar el Modelo en un Servicio
```typescript
// src/storage/mi-modelo.store.ts
import { MiModelo, type IMiModelo } from "../models/mi-modelo.model"

export class MiModeloStore {
    public async crear(data: Partial<IMiModelo>): Promise<IMiModelo> {
        try {
            const documento = new MiModelo(data)
            return await documento.save()
        } catch (error) {
            console.error("[MI-MODELO-STORE] ❌ Error creando:", error)
            throw error
        }
    }
    
    public async obtenerPorGuild(guildId: string): Promise<IMiModelo | null> {
        try {
            return await MiModelo.findOne({ guildId })
        } catch (error) {
            console.error("[MI-MODELO-STORE] ❌ Error obteniendo:", error)
            throw error
        }
    }
}
```

## 🧪 Testing y Depuración

### Logs de Depuración
```typescript
// Usar diferentes niveles según el entorno
if (CONFIG.isDevelopment()) {
    console.log("[DEBUG] Información detallada")
}

// Para errores siempre usar console.error
console.error("[MODULO] ❌ Error específico:", error)
```

### Verificación de Estado
```typescript
// Health checks regulares
public async verificarEstado(): Promise<boolean> {
    try {
        const dbStatus = await this.databaseService.healthCheck()
        const botStatus = this.client.ws.status === 0 // READY
        
        console.log("[HEALTH] 🏥 DB:", dbStatus.status, "Bot:", botStatus ? "OK" : "ERROR")
        return dbStatus.status === "connected" && botStatus
    } catch (error) {
        console.error("[HEALTH] ❌ Error en verificación:", error)
        return false
    }
}
```

## 📦 Gestión de Dependencias

### Agregar Nueva Dependencia
```bash
# Dependencia de producción
pnpm add nombre-del-paquete

# Dependencia de desarrollo
pnpm add -D nombre-del-paquete

# Actualizar dependencias
pnpm update
```

### Dependencias Críticas
- **discord.js**: Framework principal del bot
- **mongoose**: ODM para MongoDB
- **typescript**: Compilador y tipos
- **@biomejs/biome**: Linting y formateo

## 🚀 Despliegue

### Variables de Entorno para Producción
```env
NODE_ENV=production
LOG_LEVEL=warn
DISCORD_TOKEN=token_de_produccion
MONGO_URI=uri_de_produccion
```

### Proceso de Build
```bash
# Linting y formateo
npx biome check src/ --verbose

# Compilación
pnpm build

# Verificar archivos generados
ls -la dist/
```

### Optimizaciones para Producción
- Usar `LOG_LEVEL=warn` o `error` para reducir logs
- Implementar health checks automáticos
- Configurar restart automático en caso de fallos
- Usar variables de entorno específicas para producción

## 🔍 Mejores Prácticas

### 1. Manejo de Errores
```typescript
try {
    // Operación que puede fallar
    await operacionRiesgosa()
} catch (error) {
    // Log específico con contexto
    console.error("[MODULO] ❌ Error en operacionRiesgosa:", error)
    
    // Respuesta al usuario si es apropiado
    if (interaction.isRepliable()) {
        await interaction.reply({
            content: "❌ Ocurrió un error inesperado.",
            ephemeral: true
        })
    }
    
    // Re-throw si es crítico
    throw error
}
```

### 2. Validación de Datos
```typescript
// Validar entrada del usuario
if (!interaction.guild) {
    await interaction.reply({
        content: "❌ Este comando solo puede usarse en servidores.",
        ephemeral: true
    })
    return
}

// Validar permisos
const hasPermission = await this.checkPermissions(interaction)
if (!hasPermission) {
    return // El método base ya maneja la respuesta
}
```

### 3. Uso de TypeScript
```typescript
// Usar tipos específicos
interface ConfigData {
    guildId: string
    botName: string
    timezone: string
}

// Evitar 'any', usar tipos estrictos
public async configurarBot(data: ConfigData): Promise<boolean> {
    // Implementación
}
```

### 4. Limpieza de Recursos
```typescript
// Implementar cleanup en servicios
public async shutdown(): Promise<void> {
    console.log("[SERVICE] 🛑 Cerrando servicio...")
    
    // Limpiar timers, conexiones, etc.
    if (this.timer) {
        clearInterval(this.timer)
    }
    
    // Cerrar conexiones
    await this.disconnect()
    
    console.log("[SERVICE] ✅ Servicio cerrado correctamente")
}
```

## 📚 Recursos Adicionales

- [Discord.js Documentation](https://discord.js.org/#/docs/main/stable/general/welcome)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Biome Configuration](https://biomejs.dev/reference/configuration/)
