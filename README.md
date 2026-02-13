# 🪪 Bot de Discord — DNI Virtual

Bot de Discord con sistema de DNI virtual integrado con Roblox.

---

## 📋 Comandos

| Comando | Descripción |
|---|---|
| `/crear-dni` | Crea tu DNI con nombre, apellido, nacionalidad, edad, sexo y usuario de Roblox |
| `/ver-dni` | Muestra tu DNI en un embed con foto de perfil de Roblox y link al perfil |

---

## ⚙️ Instalación paso a paso

### 1. Clonar / descargar los archivos
Coloca `bot.js` y `package.json` en una carpeta.

### 2. Instalar dependencias
```bash
npm install
```

### 3. Crear el Bot en Discord Developer Portal
1. Ve a https://discord.com/developers/applications
2. Clic en **New Application** → ponle un nombre.
3. Ve a la sección **Bot** → clic en **Add Bot**.
4. Copia el **Token** del bot.
5. En **OAuth2 → URL Generator**, marca `bot` y `applications.commands`.
6. En **Bot Permissions** marca: `Send Messages`, `Embed Links`, `Use Slash Commands`.
7. Copia la URL generada e invita el bot a tu servidor.

### 4. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto (o configúralas en tu sistema):

```env
DISCORD_TOKEN=TU_TOKEN_AQUI
CLIENT_ID=ID_DE_TU_APLICACION
GUILD_ID=ID_DE_TU_SERVIDOR   # Opcional — si lo pones, los comandos se registran solo en ese servidor (instantáneo)
```

Para encontrar el **CLIENT_ID**: Discord Developer Portal → tu app → sección **General Information** → Application ID.

Para encontrar el **GUILD_ID**: En Discord, activa el modo desarrollador (Ajustes → Avanzado → Modo desarrollador), luego clic derecho en tu servidor → **Copiar ID del servidor**.

> 💡 Si no pones `GUILD_ID`, los comandos se registran globalmente (puede tardar hasta 1 hora en aparecer).

### 5. Iniciar el bot
```bash
node bot.js
```

---

## 📂 Archivos
```
📁 tu-carpeta/
├── bot.js          ← Código principal del bot
├── package.json    ← Dependencias
├── dni_db.json     ← Base de datos (se crea automáticamente)
└── README.md
```

---

## 🔧 Requisitos
- Node.js v18 o superior
- Una cuenta de Discord con un servidor donde tengas permisos de administrador

---

## 💡 Notas
- Los datos del DNI se guardan en `dni_db.json` localmente.
- Si el usuario de Roblox no existe, el bot lo notifica y no crea el DNI.
- El link al perfil de Roblox aparece en azul clickeable dentro del embed.
- La foto de perfil se obtiene automáticamente de la API pública de Roblox.
