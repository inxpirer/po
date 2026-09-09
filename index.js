const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const TOKEN = process.env.TOKEN;

const GUILD_ID = "1403699841388773386";
const CHANNEL_ID = "1403740002575192084";

client.once("ready", () => {
  console.log(`البوت اشتغل: ${client.user.tag}`);

  const channel = client.channels.cache.get(CHANNEL_ID);

  if (!channel) {
    console.log("1403740002575192084.");
    return;
  }

  joinVoiceChannel({
    channelId: CHANNEL_ID,
    guildId: GUILD_ID,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: true
  });

  console.log("البوت دخل الروم 🎧");
});

client.login(TOKEN);