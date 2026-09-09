const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const TOKEN = "MTU0Njg0MzE2MDAyODY1MTU0MA.GjV3k-.zKzqSPxeLW4VB7L32af0LAizdW_54dVLiQqej0";

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