// ============================================================
//  🤖  BOT DE DISCORD — DNI VIRTUAL
//  Comandos: /crear-dni  |  /ver-dni
// ============================================================

const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  EmbedBuilder,
  REST,
  Routes,
  Colors,
} = require("discord.js");

const fs   = require("fs");
const path = require("path");

// ─── Configuración ────────────────────────────────────────────
const TOKEN      = process.env.DISCORD_TOKEN;MTQ2OTU2MzM5ODI0ODQ2NDQ0Nw.GtQKYK.dj1rF4S2ck_9mAQVdgh_2V7u5uPuGFZP_xDWqc   // Token del bot
const CLIENT_ID  = process.env.CLIENT_ID;1469563398248464447       // ID de la aplicación (bot)
// Opcional: deja vacío o pon tu Guild ID para registrar solo en ese servidor (más rápido)
const GUILD_ID   = process.env.GUILD_ID || "";

// ─── Base de datos en JSON ────────────────────────────────────
const DB_FILE = path.join(__dirname, "dni_db.json");

function loadDB() {
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "{}");
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ─── Helpers de Roblox ────────────────────────────────────────

/** Resuelve el userId de Roblox a partir del username. */
async function getRobloxUserId(username) {
  const res = await fetch("https://users.roblox.com/v1/usernames/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
  });
  const data = await res.json();
  if (!data.data || data.data.length === 0) return null;
  return data.data[0].id;
}

/** Devuelve la URL del avatar del usuario (tamaño 420x420). */
async function getRobloxAvatarURL(userId) {
  const res = await fetch(
    `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`
  );
  const data = await res.json();
  if (!data.data || data.data.length === 0) return null;
  return data.data[0].imageUrl;
}

// ─── Definición de comandos slash ────────────────────────────
const commands = [
  new SlashCommandBuilder()
    .setName("crear-dni")
    .setDescription("Crea tu DNI virtual")
    .addStringOption((opt) =>
      opt.setName("nombre").setDescription("Tu nombre").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("apellido").setDescription("Tu apellido").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("nacionalidad").setDescription("Tu nacionalidad").setRequired(true)
    )
    .addIntegerOption((opt) =>
      opt.setName("edad").setDescription("Tu edad").setRequired(true).setMinValue(1).setMaxValue(120)
    )
    .addStringOption((opt) =>
      opt
        .setName("sexo")
        .setDescription("Tu sexo")
        .setRequired(true)
        .addChoices(
          { name: "Hombre", value: "Hombre" },
          { name: "Mujer", value: "Mujer" }
        )
    )
    .addStringOption((opt) =>
      opt
        .setName("usuario_roblox")
        .setDescription("Tu nombre de usuario en Roblox")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("ver-dni")
    .setDescription("Muestra tu DNI virtual creado con /crear-dni"),
];

// ─── Registro de comandos en Discord ─────────────────────────
async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  const route = GUILD_ID
    ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
    : Routes.applicationCommands(CLIENT_ID);

  console.log("📋 Registrando comandos slash...");
  await rest.put(route, { body: commands.map((c) => c.toJSON()) });
  console.log("✅ Comandos registrados correctamente.");
}

// ─── Cliente de Discord ───────────────────────────────────────
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("ready", () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);
});

// ─── Manejo de interacciones ──────────────────────────────────
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // ══════════════════════════════════════════════════
  //  /crear-dni
  // ══════════════════════════════════════════════════
  if (interaction.commandName === "crear-dni") {
    await interaction.deferReply({ ephemeral: true });

    const nombre      = interaction.options.getString("nombre");
    const apellido    = interaction.options.getString("apellido");
    const nacionalidad = interaction.options.getString("nacionalidad");
    const edad        = interaction.options.getInteger("edad");
    const sexo        = interaction.options.getString("sexo");
    const robloxUser  = interaction.options.getString("usuario_roblox");

    // Verificar que el usuario de Roblox existe
    let robloxId = null;
    try {
      robloxId = await getRobloxUserId(robloxUser);
    } catch {
      return interaction.editReply({
        content: "❌ No se pudo conectar con la API de Roblox. Intenta más tarde.",
      });
    }

    if (!robloxId) {
      return interaction.editReply({
        content: `❌ El usuario de Roblox **${robloxUser}** no fue encontrado. Verifica que el nombre sea correcto e intenta de nuevo.`,
      });
    }

    // Guardar en la "base de datos" JSON
    const db = loadDB();
    db[interaction.user.id] = {
      nombre,
      apellido,
      nacionalidad,
      edad,
      sexo,
      robloxUser,
      robloxId,
      creadoEn: new Date().toISOString(),
    };
    saveDB(db);

    return interaction.editReply({
      content:
        "✅ **Tu DNI ha sido creado exitosamente. Usa `/ver-dni` para visualizarlo.**",
    });
  }

  // ══════════════════════════════════════════════════
  //  /ver-dni
  // ══════════════════════════════════════════════════
  if (interaction.commandName === "ver-dni") {
    await interaction.deferReply();

    const db   = loadDB();
    const data = db[interaction.user.id];

    if (!data) {
      return interaction.editReply({
        content:
          "❌ No tienes ningún DNI creado. Usa `/crear-dni` para crear uno.",
        ephemeral: true,
      });
    }

    // Obtener foto de perfil de Roblox
    let avatarURL = null;
    try {
      avatarURL = await getRobloxAvatarURL(data.robloxId);
    } catch {
      // Si falla, el embed igual se muestra sin foto
    }

    const profileURL = `https://www.roblox.com/users/${data.robloxId}/profile`;
    const fechaDNI   = new Date(data.creadoEn).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const sexoEmoji = data.sexo === "Hombre" ? "👨" : "👩";

    const embed = new EmbedBuilder()
      .setTitle("🪪  Documento Nacional de Identidad")
      .setColor(0x1e3a8a)                          // Azul oscuro — aspecto oficial
      .setThumbnail(avatarURL ?? null)              // Foto de Roblox (cabeza)
      .addFields(
        {
          name: "👤  Nombre",
          value: `${data.nombre} ${data.apellido}`,
          inline: true,
        },
        {
          name: "🌍  Nacionalidad",
          value: data.nacionalidad,
          inline: true,
        },
        { name: "\u200B", value: "\u200B", inline: false }, // separador
        {
          name: "🎂  Edad",
          value: `${data.edad} años`,
          inline: true,
        },
        {
          name: `${sexoEmoji}  Sexo`,
          value: data.sexo,
          inline: true,
        },
        { name: "\u200B", value: "\u200B", inline: false }, // separador
        {
          name: "🎮  Usuario de Roblox",
          // Texto en azul clickeable que lleva al perfil
          value: `[${data.robloxUser}](${profileURL})`,
          inline: false,
        }
      )
      .setFooter({
        text: `DNI creado el ${fechaDNI} • Discord: ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    // Si no se pudo obtener el avatar de Roblox, avisamos en el embed
    if (!avatarURL) {
      embed.addFields({
        name: "⚠️  Advertencia",
        value: "No se pudo cargar la foto de perfil de Roblox.",
        inline: false,
      });
    }

    return interaction.editReply({ embeds: [embed] });
  }
});

// ─── Inicio ───────────────────────────────────────────────────
(async () => {
  await registerCommands();
  await client.login(TOKEN);
})();
