# 🔧 Troubleshooting - MoniBot

## Problemas Comunes y Soluciones

### 🚨 Errores de Inicio

#### "Missing required environment variables"
**Síntomas:**
```
[CONFIG] ❌ Missing required environment variables: DISCORD_TOKEN, MONGO_URI
```

**Causas Comunes:**
- Archivo `.env` no existe o está en la ubicación incorrecta
- Variables de entorno escritas incorrectamente
- Espacios extra en los valores de las variables

**Soluciones:**
1. **Verificar existencia del archivo:**
   ```bash
   ls -la .env
   # Debe mostrar el archivo .env en la raíz del proyecto
   ```

2. **Verificar contenido del archivo:**
   ```bash
   cat .env
   # Debe mostrar todas las variables requeridas
   ```

3. **Formato correcto del .env:**
   ```env
   DISCORD_TOKEN=tu_token_aqui
   DISCORD_CLIENT_ID=tu_client_id_aqui
   MONGO_URI=mongodb+srv://...
   NODE_ENV=development
   LOG_LEVEL=info
   ```

4. **Evitar espacios extra:**
   ```env
   # ❌ Incorrecto
   DISCORD_TOKEN = tu_token_aqui
   
   # ✅ Correcto
   DISCORD_TOKEN=tu_token_aqui
   ```

---

### 🗄️ Errores de Base de Datos

#### "Failed to connect to MongoDB"
**Síntomas:**
```
[DATABASE] ❌ Failed to connect to MongoDB database: discord-bot
MongoServerError: bad auth : authentication failed
```

**Causas y Soluciones:**

1. **Credenciales incorrectas:**
   - Verificar usuario y contraseña en MongoDB Atlas
   - Regenerar contraseña si es necesario

2. **IP no autorizada (MongoDB Atlas):**
   - Ir a Network Access en MongoDB Atlas
   - Agregar tu IP actual o usar `0.0.0.0/0` para permitir todas

3. **URI malformada:**
   ```env
   # ❌ Incorrecto
   MONGO_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/
   
   # ✅ Correcto
   MONGO_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/discord-bot?retryWrites=true&w=majority
   ```

4. **Problema de red:**
   ```bash
   # Probar conectividad
   ping cluster.mongodb.net
   ```

#### "Database connection timeout"
**Síntomas:**
```
[DATABASE] ❌ Health check failed - Latency: 30000ms, Error: MongoServerSelectionError
```

**Soluciones:**
1. Verificar conexión a internet
2. Verificar firewall corporativo
3. Intentar con VPN si estás en una red restringida
4. Verificar que el cluster de MongoDB esté activo

---

### 🤖 Errores del Bot de Discord

#### "Bot no responde a comandos"
**Verificaciones:**

1. **Estado del bot:**
   ```
   [BOT] 🤖 Bot logged in as MoniBot#1234
   [BOT] ✅ Successfully registered 8 slash commands
   ```

2. **Permisos del bot en Discord:**
   - Verificar que el bot tiene permiso "Use Slash Commands"
   - Verificar que el bot puede enviar mensajes en el canal
   - Revisar jerarquía de roles

3. **Comandos registrados:**
   - Los comandos slash pueden tardar hasta 1 hora en propagarse globalmente
   - Usar comandos de servidor para testing inmediato

#### "Invalid token"
**Síntomas:**
```
[BOT] ❌ Failed to start bot: Error [TokenInvalid]: An invalid token was provided.
```

**Soluciones:**
1. **Regenerar token en Discord Developer Portal:**
   - Ir a la sección "Bot" 
   - Hacer clic en "Reset Token"
   - Actualizar `.env` con el nuevo token

2. **Verificar que no hay espacios extra:**
   ```env
   # Verificar que no hay espacios antes o después
   DISCORD_TOKEN=MTM5ODYxMzI5NzUxOTEzNjgwOA.G6biRU.example
   ```

#### "Missing Permissions"
**Síntomas:**
```
DiscordAPIError[50013]: Missing Permissions
```

**Soluciones:**
1. **Verificar permisos del bot:**
   - Manage Nicknames (para cambiar nombre del bot)
   - Send Messages
   - Use Slash Commands
   - Embed Links

2. **Verificar jerarquía de roles:**
   - El rol del bot debe estar por encima de los roles que intenta gestionar

---

### ⚙️ Errores de Comandos

#### "/setup no funciona"
**Verificaciones:**

1. **Permisos del usuario:**
   ```typescript
   // El comando setup requiere ser administrador o tener roles específicos
   const hasPermission = await this.checkConfigurationPermissions(interaction)
   ```

2. **Log esperado:**
   ```
   [SETUP] 🚀 Setup command initiated by Usuario#1234 in guild MiServidor
   ```

3. **Si se niega acceso:**
   ```
   [SETUP] ❌ Permission denied for Usuario#1234
   ```

**Soluciones:**
- Usuario debe ser administrador del servidor
- O tener roles configurados con permisos de setup
- Verificar con `/permissions` qué permisos tiene el usuario

#### "/status devuelve información incorrecta"
**Problemas comunes:**

1. **En Windows:**
   - Comandos de sistema pueden no funcionar
   - Verificar que los comandos están adaptados al SO

2. **En servidores virtuales:**
   - Información de CPU puede ser limitada
   - Información de disco puede mostrar el contenedor, no el host

3. **Permisos de sistema:**
   ```bash
   # En Linux, verificar permisos
   whoami
   groups
   ```

---

### 📝 Problemas de Logs

#### "Logs muy verbosos"
**Solución:**
```env
# Cambiar nivel de log
LOG_LEVEL=warn  # Solo warnings y errores
LOG_LEVEL=error # Solo errores
```

#### "No aparecen logs de debug"
**Verificar configuración:**
```env
NODE_ENV=development
LOG_LEVEL=debug
```

#### "Logs mezclados o ilegibles"
**Cada log debe tener su prefijo:**
```
[DATABASE] ✅ Connected successfully
[BOT] 🤖 Bot logged in as MoniBot#1234
[MAIN] 🚀 Starting application
```

---

### 🔧 Problemas de Desarrollo

#### "TypeScript no compila"
**Errores comunes:**

1. **Tipos faltantes:**
   ```bash
   pnpm add -D @types/node
   ```

2. **Configuración de tsconfig.json:**
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "commonjs",
       "strict": true,
       "esModuleInterop": true
     }
   }
   ```

3. **Problemas de paths:**
   ```bash
   # Verificar que tsconfig-paths está instalado
   pnpm add -D tsconfig-paths
   ```

#### "Biome reporta errores"
**Comandos útiles:**
```bash
# Ver todos los errores
npx biome check src/ --verbose

# Formatear automáticamente
npx biome format src/ --write

# Ver configuración actual
cat biome.json
```

#### "Hot reload no funciona"
**Verificar configuración de ts-node-dev:**
```json
{
  "scripts": {
    "dev": "ts-node-dev -r tsconfig-paths/register --respawn --transpile-only --env-file=.env src/main.ts"
  }
}
```

---

### 🚀 Problemas de Producción

#### "Bot se desconecta frecuentemente"
**Causas y soluciones:**

1. **Memoria insuficiente:**
   ```bash
   # Monitorear uso de memoria
   top -p $(pgrep node)
   ```

2. **Límites de rate limiting:**
   - Discord tiene límites de API
   - Implementar backoff automático

3. **Conexión de red inestable:**
   - Implementar reconexión automática
   - Verificar logs de red

#### "Rendimiento degradado"
**Optimizaciones:**

1. **Usar LOG_LEVEL=warn en producción:**
   ```env
   NODE_ENV=production
   LOG_LEVEL=warn
   ```

2. **Monitorear consultas a base de datos:**
   ```typescript
   // Usar índices en MongoDB
   await GuildConfig.createIndex({ guildId: 1 })
   ```

3. **Caché para configuraciones frecuentes:**
   ```typescript
   // Implementar caché en memoria para configuraciones
   private configCache = new Map<string, IGuildConfig>()
   ```

---

## 📊 Herramientas de Diagnóstico

### Verificación de Estado General
```bash
# Script de verificación rápida
echo "🔍 Verificando estado del bot..."

# Verificar archivos importantes
echo "📁 Archivos:"
ls -la .env package.json tsconfig.json

# Verificar dependencias
echo "📦 Dependencias:"
pnpm list --depth=0

# Verificar compilación
echo "🔨 Compilación:"
pnpm build

# Verificar linting
echo "🔍 Linting:"
npx biome check src/
```

### Logs de Debugging
```typescript
// Activar logs detallados temporalmente
if (CONFIG.isDevelopment()) {
    mongoose.set('debug', true)  // Logs de MongoDB
    
    // Log de todas las interacciones
    this.client.on('debug', console.log)
}
```

### Health Check Manual
```bash
# Verificar conectividad a MongoDB
mongosh "mongodb+srv://tu-uri-aqui" --eval "db.runCommand('ping')"

# Verificar conectividad a Discord
curl -H "Authorization: Bot tu-token-aqui" https://discord.com/api/v10/users/@me
```

---

## 📞 Obtener Ayuda

### Información para Reportar Issues

Al reportar un problema, incluye:

1. **Logs relevantes:**
   ```
   [TIMESTAMP] [MODULE] ❌ Error description
   ```

2. **Configuración del entorno:**
   ```
   NODE_ENV=development
   Discord.js version: 14.21.0
   Node.js version: v18.x.x
   OS: macOS/Linux/Windows
   ```

3. **Pasos para reproducir:**
   - Comando ejecutado
   - Respuesta esperada vs actual
   - Contexto (servidor, canal, usuario)

4. **Configuración relevante:**
   - Permisos del bot
   - Configuración del servidor
   - Variables de entorno (sin incluir tokens)

### Recursos Útiles
- [Discord.js Guía](https://discordjs.guide/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Node.js Troubleshooting](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
