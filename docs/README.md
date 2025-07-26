# 🤖 MoniBot - Discord Bot de Monitoreo y Gestión

## Descripción General

MoniBot es un bot de Discord desarrollado en TypeScript que proporciona herramientas completas de monitoreo del sistema, gestión de servidores y configuración avanzada. Diseñado con una arquitectura moderna y escalable, utiliza MongoDB para persistencia de datos y ofrece una interfaz de usuario intuitiva mediante componentes nativos de Discord.

## ✨ Características Principales

### 🔧 Configuración Avanzada
- **Asistente de setup interactivo** con modales y menús de selección
- **Configuración por servidor** almacenada en MongoDB Cloud
- **Sistema de permisos granular** basado en roles
- **Personalización completa** del comportamiento del bot

### 📊 Monitoreo del Sistema
- **Información en tiempo real** de CPU, RAM, disco y uptime
- **Compatibilidad cross-platform** (Linux, macOS, Windows)
- **Comandos específicos por sistema operativo**
- **Health checks** automáticos de base de datos

### 🛡️ Gestión y Seguridad
- **Sistema de permisos avanzado** con verificación por roles
- **Logs estructurados** con prefijos por módulo
- **Manejo robusto de errores** y reconexión automática
- **Graceful shutdown** con limpieza de recursos

## 🏗️ Arquitectura del Sistema

```
src/
├── main.ts                     # Punto de entrada principal
├── bot.ts                      # Clase principal del bot
├── commands/                   # Comandos slash
│   ├── base.command.ts        # Clase base para comandos
│   ├── setup.command.ts       # Asistente de configuración
│   ├── status.command.ts      # Monitoreo del sistema
│   ├── reboot.command.ts      # Reinicio seguro
│   ├── permissions.command.ts # Gestión de permisos
│   └── ...                    # Otros comandos
├── services/                   # Servicios de negocio
│   ├── database.service.ts    # Gestión de MongoDB
│   ├── bot-management.service.ts # Gestión del bot
│   ├── permission.service.ts  # Sistema de permisos
│   └── system.service.ts      # Información del sistema
├── config/                     # Configuración
│   └── config.service.ts      # Servicio de configuración
├── models/                     # Modelos de datos
│   └── guild.model.ts         # Modelo de servidor
├── storage/                    # Capa de persistencia
│   └── config.store.ts        # Almacenamiento de configuración
└── types/                      # Definiciones de tipos
    └── config.types.ts        # Tipos de configuración
```

## 🚀 Tecnologías Utilizadas

- **[Discord.js v14](https://discord.js.org/)** - Framework principal del bot
- **[TypeScript](https://www.typescriptlang.org/)** - Desarrollo type-safe
- **[MongoDB](https://www.mongodb.com/)** + **[Mongoose](https://mongoosejs.com/)** - Base de datos
- **[Biome](https://biomejs.dev/)** - Linting y formateo
- **[Node.js](https://nodejs.org/)** - Runtime de JavaScript

## 📦 Comandos Disponibles

### `/setup` - Configuración del Bot
Asistente interactivo para configurar el bot en tu servidor:
- Configuración básica (nombre, zona horaria)
- Asignación de roles de administración
- Selección de canales específicos
- Activación/desactivación de características

### `/status` - Monitoreo del Sistema
Información detallada del sistema host:
- Uso de CPU y RAM
- Espacio en disco disponible
- Uptime del sistema y del bot
- Estado de la conexión a base de datos

### `/reboot` - Reinicio Seguro
Reinicio controlado del sistema con:
- Confirmación requerida
- Timeout de seguridad (30s)
- Comandos específicos por SO
- Verificación de permisos

### `/permissions` - Gestión de Permisos
Control granular de acceso:
- Visualización de configuración actual
- Asignación interactiva de roles
- Permisos por comando individual

### Comandos Adicionales
- `/botinfo` - Información del bot y estadísticas
- `/setname` - Cambio de nombre del bot
- `/config` - Gestión de configuración avanzada
- `/testdb` - Prueba de conexión a base de datos

## 🔧 Instalación y Configuración

Ver la [Guía de Instalación](./INSTALLATION.md) para instrucciones detalladas.

## 📚 Documentación Adicional

- [Guía de Desarrollo](./DEVELOPMENT.md)
- [API Reference](./API.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Changelog](./CHANGELOG.md)

## 🤝 Contribuciones

Este proyecto está desarrollado y mantenido por [usarral](https://github.com/usarral).

## 📄 Licencia

ISC License - Ver [LICENSE](../LICENSE) para más detalles.
