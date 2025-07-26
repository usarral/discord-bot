# 📁 Estructura del Proyecto - MoniBot

## Organización de Archivos

```
discord-bot/
├── 📄 README.md                    # Descripción principal del proyecto
├── 📄 LICENSE                      # Licencia MIT
├── 📄 .gitignore                   # Archivos ignorados por Git
├── 📄 .env.example                 # Plantilla de variables de entorno
├── 📄 package.json                 # Dependencias y scripts
├── 📄 pnpm-lock.yaml              # Lock file de pnpm
├── 📄 tsconfig.json               # Configuración de TypeScript
├── 📄 biome.json                  # Configuración de Biome (linting)
│
├── 📁 docs/                        # Documentación del proyecto
│   ├── 📄 README.md               # Documentación principal
│   ├── 📄 INSTALLATION.md         # Guía de instalación
│   ├── 📄 DEVELOPMENT.md          # Guía de desarrollo
│   ├── 📄 API.md                  # Referencia de API
│   ├── 📄 TROUBLESHOOTING.md      # Solución de problemas
│   ├── 📄 CHANGELOG.md            # Historial de cambios
│   └── 📄 PROJECT-STRUCTURE.md    # Este archivo
│
├── 📁 src/                         # Código fuente principal
│   ├── 📄 main.ts                 # Punto de entrada de la aplicación
│   ├── 📄 bot.ts                  # Clase principal del bot
│   │
│   ├── 📁 commands/               # Comandos slash de Discord
│   │   ├── 📄 base.command.ts     # Clase base abstracta para comandos
│   │   ├── 📄 setup.command.ts    # Asistente de configuración
│   │   ├── 📄 status.command.ts   # Monitoreo del sistema
│   │   ├── 📄 reboot.command.ts   # Reinicio del sistema
│   │   ├── 📄 permissions.command.ts # Gestión de permisos
│   │   ├── 📄 botinfo.command.ts  # Información del bot
│   │   ├── 📄 setname.command.ts  # Cambio de nombre del bot
│   │   ├── 📄 config.command.ts   # Configuración avanzada
│   │   └── 📄 testdb.command.ts   # Prueba de base de datos
│   │
│   ├── 📁 services/               # Servicios de negocio
│   │   ├── 📄 database.service.ts # Gestión de MongoDB
│   │   ├── 📄 bot-management.service.ts # Gestión del bot
│   │   ├── 📄 permission.service.ts # Sistema de permisos
│   │   └── 📄 system.service.ts   # Información del sistema
│   │
│   ├── 📁 config/                 # Configuración de la aplicación
│   │   └── 📄 config.service.ts   # Servicio de configuración
│   │
│   ├── 📁 models/                 # Modelos de datos (MongoDB)
│   │   └── 📄 guild.model.ts      # Modelo de configuración de servidor
│   │
│   ├── 📁 storage/                # Capa de persistencia
│   │   └── 📄 config.store.ts     # Almacenamiento de configuración
│   │
│   └── 📁 types/                  # Definiciones de tipos TypeScript
│       └── 📄 config.types.ts     # Tipos de configuración
│
├── 📁 dist/                       # Código compilado (generado)
│   └── ...                        # Archivos JavaScript compilados
│
└── 📁 node_modules/               # Dependencias instaladas
    └── ...                        # Paquetes de npm/pnpm
```

## Descripción de Directorios

### `/src` - Código Fuente Principal

#### **Archivos Raíz**
- `main.ts` - Punto de entrada, maneja el ciclo de vida de la aplicación
- `bot.ts` - Clase principal del bot, maneja eventos y comandos

#### **`/commands`** - Sistema de Comandos
Todos los comandos slash del bot. Cada comando extiende `BaseCommand` y sigue el patrón Command.

**Convenciones:**
- Archivos nombrados como `[comando].command.ts`
- Clase nombrada como `[Comando]Command`
- Un comando por archivo
- Implementación de `executeCommand()` obligatoria

#### **`/services`** - Lógica de Negocio
Servicios que manejan la lógica principal de la aplicación.

**Características:**
- Patrón Singleton para servicios compartidos
- Separación clara de responsabilidades
- Manejo de errores robusto
- Logs estructurados

#### **`/config`** - Configuración
Gestión centralizada de configuración y variables de entorno.

#### **`/models`** - Modelos de Datos
Esquemas de MongoDB usando Mongoose para definir la estructura de datos.

#### **`/storage`** - Capa de Persistencia
Abstracción para operaciones de base de datos, implementa patrones Repository.

#### **`/types`** - Definiciones de Tipos
Tipos TypeScript personalizados y interfaces para el proyecto.

### `/docs` - Documentación

Documentación completa del proyecto organizada por propósito:
- **Instalación** - Guía paso a paso para configurar el proyecto
- **Desarrollo** - Convenciones, patrones y mejores prácticas
- **API** - Referencia completa de clases, métodos y tipos
- **Troubleshooting** - Solución de problemas comunes
- **Changelog** - Historial de versiones y cambios

## Patrones de Diseño Utilizados

### 1. **Singleton Pattern**
```typescript
// Servicios principales usan instancia única
export class DatabaseService {
    private static instance: DatabaseService
    public static getInstance(): DatabaseService { ... }
}
```

**Aplicado en:**
- `DatabaseService`
- `ConfigService`
- `BotManagementService`

### 2. **Command Pattern**
```typescript
// Comandos implementan interfaz común
export abstract class BaseCommand {
    public abstract executeCommand(interaction: ChatInputCommandInteraction): Promise<void>
}
```

**Aplicado en:**
- Todos los comandos slash
- Sistema de permisos integrado
- Manejo de errores consistente

### 3. **Repository Pattern**
```typescript
// Capa de abstracción para datos
export class ConfigStore {
    public async getConfig(guildId: string): Promise<IGuildConfig | null> { ... }
    public async saveConfig(guildId: string, config: Partial<IGuildConfig>): Promise<IGuildConfig> { ... }
}
```

**Aplicado en:**
- `ConfigStore`
- Separación de lógica de negocio y persistencia

### 4. **Factory Pattern**
```typescript
// Carga automática de comandos
private loadCommands(): void {
    const commands = [
        new SetupCommand(),
        new StatusCommand(),
        // ...
    ]
}
```

**Aplicado en:**
- Carga de comandos
- Inicialización de servicios

## Convenciones de Código

### Nomenclatura
| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Clases | PascalCase | `DatabaseService` |
| Métodos | camelCase | `connectToDatabase` |
| Constantes | UPPER_SNAKE_CASE | `DISCORD_TOKEN` |
| Archivos | kebab-case | `bot-management.service.ts` |
| Interfaces | PascalCase con I | `IGuildConfig` |
| Tipos | PascalCase | `ConfigData` |

### Estructura de Archivos
```typescript
// 1. Imports (externos primero, luego internos)
import { Client } from "discord.js"
import { DatabaseService } from "./services/database.service"

// 2. Interfaces y tipos (si son específicos del archivo)
interface LocalInterface { ... }

// 3. Constantes
const CONSTANTS = { ... }

// 4. Clase principal
export class MainClass {
    // Propiedades privadas primero
    private readonly service: DatabaseService
    
    // Propiedades públicas
    public readonly name: string
    
    // Constructor
    constructor() { ... }
    
    // Métodos públicos
    public async publicMethod(): Promise<void> { ... }
    
    // Métodos privados al final
    private privateMethod(): void { ... }
}
```

### Sistema de Logs
```typescript
// Prefijos por módulo
const LOG_PREFIXES = {
    MAIN: "[MAIN]",
    BOT: "[BOT]", 
    DATABASE: "[DATABASE]",
    CONFIG: "[CONFIG]",
    COMMAND: "[COMMAND]"
}

// Niveles de log con emojis
console.log("[MODULE] ✅ Success message")
console.warn("[MODULE] ⚠️ Warning message") 
console.error("[MODULE] ❌ Error message")
console.log("[MODULE] 🔄 Process message")
console.log("[MODULE] 📊 Info message")
```

## Dependencias Principales

### Producción
| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `discord.js` | ^14.21.0 | Framework del bot de Discord |
| `mongoose` | ^8.16.5 | ODM para MongoDB |
| `@types/mongoose` | ^5.11.97 | Tipos TypeScript para Mongoose |

### Desarrollo
| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `typescript` | ^5.8.3 | Compilador TypeScript |
| `@biomejs/biome` | 2.1.2 | Linting y formateo |
| `ts-node-dev` | ^2.0.0 | Hot reload para desarrollo |
| `@types/node` | ^24.1.0 | Tipos Node.js |
| `tsconfig-paths` | ^4.2.0 | Resolución de paths |

## Scripts Disponibles

```json
{
  "build": "tsc",                    // Compilar TypeScript
  "build:watch": "tsc --watch",      // Compilar en modo watch
  "start": "node -r tsconfig-paths/register --env-file=.env dist/main.js", // Producción
  "dev": "ts-node-dev -r tsconfig-paths/register --respawn --transpile-only --env-file=.env src/main.ts" // Desarrollo
}
```

### Comandos Adicionales
```bash
# Linting y formateo
npx biome check src/              # Verificar issues
npx biome format src/ --write     # Formatear código

# Gestión de dependencias
pnpm install                      # Instalar dependencias
pnpm update                       # Actualizar dependencias
pnpm audit                        # Auditoría de seguridad
```

## Variables de Entorno

### Requeridas
- `DISCORD_TOKEN` - Token del bot de Discord
- `DISCORD_CLIENT_ID` - ID de la aplicación Discord
- `MONGO_URI` - URI de conexión a MongoDB

### Opcionales
- `NODE_ENV` - Entorno de ejecución (development/production/test)
- `LOG_LEVEL` - Nivel de logging (debug/info/warn/error)
- `PORT` - Puerto para funcionalidades web futuras

### Archivo `.env.example`
Plantilla con todas las variables necesarias y ejemplos de formato.

## Configuración de Herramientas

### TypeScript (`tsconfig.json`)
- Target: ES2020
- Module: CommonJS
- Strict mode habilitado
- Paths configurados para imports relativos

### Biome (`biome.json`)
- Formateo con tabs
- Comillas dobles
- Semicolons opcionales
- Linting con reglas recomendadas

### Git (`.gitignore`)
- Variables de entorno excluidas
- Archivos de build ignorados
- Dependencias y logs ignorados
- Archivos específicos de IDE/OS ignorados

## Mejores Prácticas

1. **Separación de Responsabilidades** - Cada clase tiene un propósito específico
2. **Inyección de Dependencias** - Servicios se pasan como parámetros cuando es apropiado
3. **Manejo de Errores** - Try-catch en todos los métodos asíncronos
4. **Logging Estructurado** - Logs consistentes con prefijos y niveles
5. **Tipado Fuerte** - Evitar `any`, usar tipos específicos
6. **Documentación** - JSDoc para métodos públicos importantes
7. **Testing Ready** - Estructura preparada para tests futuros

## Extensibilidad

### Agregar Nuevo Comando
1. Crear archivo en `/commands`
2. Extender `BaseCommand`
3. Implementar `executeCommand()`
4. Registrar en `bot.ts`

### Agregar Nuevo Servicio
1. Crear archivo en `/services`
2. Implementar patrón Singleton si es necesario
3. Usar inyección de dependencias
4. Agregar logs estructurados

### Agregar Nuevo Modelo
1. Crear esquema en `/models`
2. Crear store en `/storage`
3. Definir tipos en `/types`
4. Integrar con servicios existentes

Esta estructura está diseñada para ser escalable, mantenible y fácil de entender tanto para desarrollo individual como en equipo.
