# 📦 Guía de Instalación - MoniBot

## Prerrequisitos

### Requisitos del Sistema
- **Node.js** v18.x o superior
- **pnpm** v8.x o superior (recomendado) o npm
- **MongoDB** Atlas cuenta (gratuita) o instancia local
- **Discord** Developer Application

### Herramientas de Desarrollo (Opcional)
- **Git** para control de versiones
- **VS Code** con extensiones de TypeScript
- **MongoDB Compass** para gestión visual de la base de datos

## 🔧 Configuración del Bot de Discord

### 1. Crear Aplicación en Discord
1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Haz clic en "New Application"
3. Asigna un nombre a tu bot (ej: "MoniBot")
4. Ve a la pestaña "Bot"
5. Haz clic en "Add Bot"
6. **Guarda el Token** (necesario para `.env`)

### 2. Configurar Permisos
En la pestaña "Bot", asegúrate de activar:
- `Send Messages`
- `Use Slash Commands`
- `Embed Links`
- `Manage Nicknames` (para cambiar el nombre del bot)
- `View Channels`

### 3. Obtener Client ID
En la pestaña "General Information", copia el **Application ID** (necesario para `.env`)

### 4. Invitar el Bot
1. Ve a la pestaña "OAuth2" > "URL Generator"
2. Selecciona scopes: `bot` y `applications.commands`
3. Selecciona los permisos necesarios
4. Usa la URL generada para invitar el bot a tu servidor

## 🗄️ Configuración de MongoDB

### Opción A: MongoDB Atlas (Recomendado)
1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (M0 gratis)
4. Configura acceso de red (añade tu IP o permite todas: `0.0.0.0/0`)
5. Crea un usuario de base de datos
6. Obtén la **Connection String** (necesaria para `.env`)

### Opción B: MongoDB Local
```bash
# En Ubuntu/Debian
sudo apt update
sudo apt install mongodb

# En macOS con Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Iniciar el servicio
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS
```

## 🛠️ Instalación del Proyecto

### 1. Clonar o Descargar
```bash
# Si tienes acceso al repositorio
git clone <repository-url>
cd discord-bot

# O descomprime el archivo ZIP en una carpeta
```

### 2. Instalar Dependencias
```bash
# Con pnpm (recomendado)
pnpm install

# O con npm
npm install
```

### 3. Configurar Variables de Entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env con tus datos
nano .env  # o usa tu editor favorito
```

### 4. Archivo `.env` Completo
```env
# Bot Discord Token (desde Discord Developer Portal)
DISCORD_TOKEN=tu_token_aqui

# Application ID del bot (desde Discord Developer Portal)
DISCORD_CLIENT_ID=tu_client_id_aqui

# URI de MongoDB Atlas o local
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/discord-bot?retryWrites=true&w=majority

# Configuración del entorno
NODE_ENV=development
LOG_LEVEL=info

# Puerto para futuras funcionalidades web (opcional)
PORT=3000
```

## 🚀 Ejecutar el Bot

### Modo Desarrollo
```bash
# Con hot reload automático
pnpm dev

# O con npm
npm run dev
```

### Modo Producción
```bash
# Compilar TypeScript
pnpm build

# Ejecutar el bot
pnpm start

# O con npm
npm run build
npm start
```

## ✅ Verificación de la Instalación

### 1. Verificar Logs
Al iniciar, deberías ver logs similares a:
```
[MAIN] 🚀 Iniciando MoniBot...
[CONFIG] 🔧 Initializing configuration service...
[CONFIG] ✅ Configuration loaded successfully - Environment: development, Log Level: info
[BOT] 🚀 Starting Discord bot...
[DATABASE] 🔄 Connecting to MongoDB database: discord-bot
[DATABASE] ✅ Connected to MongoDB - Database: discord-bot
[BOT] ✅ Loaded 8 commands successfully
[BOT] 🤖 Bot logged in as MoniBot#1234
[BOT] 🔄 Registering slash commands...
[BOT] ✅ Successfully registered 8 slash commands
```

### 2. Probar Comandos
En tu servidor de Discord:
1. Escribe `/` para ver los comandos disponibles
2. Ejecuta `/setup` para configurar el bot
3. Usa `/status` para verificar el monitoreo del sistema

## 🔧 Solución de Problemas Comunes

### Error: "Missing required environment variables"
- Verifica que tu archivo `.env` existe y tiene todas las variables
- Asegúrate de que no hay espacios extra en los valores

### Error: "Failed to connect to MongoDB"
- Verifica la URI de MongoDB
- Asegúrate de que tu IP está en la whitelist (MongoDB Atlas)
- Confirma que las credenciales son correctas

### Bot no responde a comandos
- Verifica que el bot está online en Discord
- Asegúrate de que tiene permisos de `Use Slash Commands`
- Verifica que los comandos se registraron correctamente

### Problemas de permisos
- El bot necesita permisos en el servidor para funcionar
- Algunos comandos requieren que el bot tenga roles específicos
- Verifica la configuración con `/permissions`

## 📱 Configuración Inicial en Discord

1. **Ejecutar Setup**: Usa `/setup` en tu servidor
2. **Configurar Roles**: Asigna roles de administración
3. **Seleccionar Canales**: Elige canales para notificaciones
4. **Probar Funcionalidades**: Usa `/status` y otros comandos

## 🔄 Actualización

Para actualizar el bot:
```bash
# Detener el bot (Ctrl+C)

# Actualizar dependencias
pnpm update

# Recompilar
pnpm build

# Reiniciar
pnpm start
```

## 📞 Soporte

Si encuentras problemas:
1. Revisa la sección de [Troubleshooting](./TROUBLESHOOTING.md)
2. Verifica los logs del bot para errores específicos
3. Consulta la documentación de Discord.js si es un problema de API
