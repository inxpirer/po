const { Client } = require('discord.js-selfbot-v13');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { GUILD_ID, CHANNEL_ID } = process.env;

// Load tokens from .env or tokens.txt
let tokens = [];

// Check if TOKENS is defined in .env (comma-separated)
if (process.env.TOKENS) {
  tokens = process.env.TOKENS.split(',').map(t => t.trim()).filter(t => t);
}
// Check if single TOKEN is defined
else if (process.env.DISCORD_TOKEN) {
  tokens = [process.env.DISCORD_TOKEN];
}
// Check for tokens.txt file
else if (fs.existsSync(path.join(__dirname, 'tokens.txt'))) {
  tokens = fs.readFileSync(path.join(__dirname, 'tokens.txt'), 'utf8')
    .split('\n')
    .map(t => t.trim())
    .filter(t => t && !t.startsWith('#'));
}

if (tokens.length === 0 || !GUILD_ID || !CHANNEL_ID) {
  console.error('❌ Missing required configuration!');
  console.error('');
  console.error('Setup options:');
  console.error('1. Add TOKENS=token1,token2,token3 in .env file (comma-separated)');
  console.error('2. Or create tokens.txt file with one token per line');
  console.error('3. Or use single DISCORD_TOKEN in .env');
  console.error('');
  console.error('Also set GUILD_ID and CHANNEL_ID in .env');
  process.exit(1);
}

console.log(`🚀 Starting Discord AFK Tool for ${tokens.length} account(s)...`);

const clients = new Map();

async function createClient(token, index) {
  const client = new Client();

  async function joinVoiceChannel() {
    try {
      const guild = await client.guilds.fetch(GUILD_ID);
      const channel = await guild.channels.fetch(CHANNEL_ID);

      if (!channel) {
        console.error(`[Client ${index + 1}] ❌ Channel not found!`);
        return false;
      }

      if (!channel.isVoice()) {
        console.error(`[Client ${index + 1}] ❌ Channel is not a voice channel!`);
        return false;
      }

      console.log(`[Client ${index + 1}] 📢 Joining voice channel: ${channel.name} in ${guild.name}`);

      const connection = await client.voice.joinChannel(channel, {
        selfDeaf: false,
        selfMute: false,
        selfVideo: true
      });

      console.log(`[Client ${index + 1}] ✅ Successfully joined voice channel!`);
      console.log(`[Client ${index + 1}] 📹 Camera enabled!`);

      setTimeout(async () => {
        try {
          const streamConn = await connection.createStreamConnection();
          console.log(`[Client ${index + 1}] 📺 Livestream enabled!`);
        } catch (err) {
          console.error(`[Client ${index + 1}] ❌ Error enabling livestream:`, err.message);
        }
      }, 3000);

      console.log(`[Client ${index + 1}] 🔊 AFK mode active - staying in channel...`);
      return true;

    } catch (error) {
      try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const member = await guild.members.fetch(client.user.id);

        if (member.voice && member.voice.channelId) {
          console.log(`[Client ${index + 1}] ✅ Connection established!`);
          console.log(`[Client ${index + 1}] 📹 Camera enabled!`);

          const connection = client.voice.connection;
          if (connection) {
            setTimeout(async () => {
              try {
                const streamConn = await connection.createStreamConnection();
                console.log(`[Client ${index + 1}] 📺 Livestream enabled!`);
              } catch (err) {
                console.error(`[Client ${index + 1}] ❌ Error enabling livestream:`, err.message);
              }
            }, 3000);
          }

          console.log(`[Client ${index + 1}] 🔊 AFK mode active - staying in channel...`);
          return true;
        }
      } catch (e) {
        // Ignore
      }

      console.error(`[Client ${index + 1}] ❌ Error joining channel:`, error.message);
      return false;
    }
  }

  async function checkAndJoinVC() {
    try {
      const guild = await client.guilds.fetch(GUILD_ID);
      const member = await guild.members.fetch(client.user.id);

      if (member.voice && member.voice.channelId) {
        console.log(`[Client ${index + 1}] ✅ Already in voice channel in target server: ${member.voice.channel.name} - not joining`);
        return true;
      }

      console.log(`[Client ${index + 1}] ❌ Not in any voice channel in target server. Joining...`);
      return await joinVoiceChannel();

    } catch (error) {
      console.error(`[Client ${index + 1}] ❌ Error checking voice state:`, error.message);
      return await joinVoiceChannel();
    }
  }

  client.on('ready', async () => {
    console.log(`[Client ${index + 1}] ✅ Logged in as ${client.user.tag}`);

    const success = await checkAndJoinVC();

    if (!success) {
      console.log(`[Client ${index + 1}] ⚠️ Retrying in 5 seconds...`);
      setTimeout(async () => {
        await checkAndJoinVC();
      }, 5000);
    }
  });

  client.on('voiceStateUpdate', async (oldState, newState) => {
    if (newState.member.id === client.user.id) {
      if (!newState.channelId) {
        console.log(`[Client ${index + 1}] ⚠️ Disconnected from voice channel. Reconnecting in 3 seconds...`);
        setTimeout(async () => {
          await checkAndJoinVC();
        }, 3000);
      }
    }
  });

  client.on('error', (error) => {
    console.error(`[Client ${index + 1}] ❌ Client error:`, error.message);
  });

  client.on('disconnect', () => {
    console.log(`[Client ${index + 1}] ⚠️ Disconnected from Discord. Reconnecting...`);
  });

  try {
    await client.login(token);
    clients.set(token, client);
  } catch (err) {
    console.error(`[Client ${index + 1}] ❌ Failed to login:`, err.message);
  }
}

// Initialize all clients
(async () => {
  for (let i = 0; i < tokens.length; i++) {
    await createClient(tokens[i], i);
    // Small delay between logins to avoid rate limits
    if (i < tokens.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
})();

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  for (const [token, client] of clients) {
    client.destroy();
  }
  process.exit(0);
});
