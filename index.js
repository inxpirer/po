const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const TOKEN = "MTU0Njg1NDAzODI1ODMxOTM5MA.G5oS12.aMDFj0XX2rGMxIkxLtHyb6_McoBiLeIaU-meYE";

const GUILD_ID = "1403699841388773386";
const CHANNEL_ID = "1403699841388773390";

client.once("ready", async () => {
  console.log(`البوت اشتغل: ${client.user.tag}`);

  const channel = await client.channels.fetch(CHANNEL_ID);

  joinVoiceChannel({
    channelId: channel.id,
    guildId: GUILD_ID,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: true
  });

  console.log("البوت دخل الروم الصوتي 🎤");
});

client.login(TOKEN);
