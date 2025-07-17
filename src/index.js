require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Events, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { setupModDatabase } = require('./database/modDatabase');
const { setupLogDatabase } = require('./database/logDatabase');


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
  ]
});


client.commands = new Collection();
client.slashCommands = new Collection();
client.prefix = process.env.PREFIX || '.';


setupModDatabase();
setupLogDatabase();


const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if (command.name) {
    client.commands.set(command.name, command);
    console.log(`Prefix komutu yüklendi: ${command.name}`);
  }
}


const slashCommandsPath = path.join(__dirname, 'slashCommands');
const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));
const slashCommands = [];

for (const file of slashCommandFiles) {
  const filePath = path.join(slashCommandsPath, file);
  const command = require(filePath);
  if (command.data) {
    client.slashCommands.set(command.data.name, command);
    slashCommands.push(command.data.toJSON());
    console.log(`Slash komutu yüklendi: ${command.data.name}`);
  }
}


const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const eventModule = require(filePath);
  
  
  if (Array.isArray(eventModule)) {
    eventModule.forEach(event => {
      if (event && event.name) {
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args, client));
        } else {
          client.on(event.name, (...args) => event.execute(...args, client));
        }
        console.log(`Olay yüklendi: ${event.name}`);
      }
    });
  } else if (eventModule && eventModule.name) {
    
    if (eventModule.once) {
      client.once(eventModule.name, (...args) => eventModule.execute(...args, client));
    } else {
      client.on(eventModule.name, (...args) => eventModule.execute(...args, client));
    }
    console.log(`Olay yüklendi: ${eventModule.name}`);
  }
}


client.once(Events.ClientReady, async () => {
  try {
    console.log(`${client.user.tag} olarak giriş yapıldı!`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    
    console.log('Slash komutları yükleniyor...');
    
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: slashCommands },
    );
    
    console.log('Slash komutları başarıyla yüklendi!');
  } catch (error) {
    console.error('Slash komutları yüklenirken hata oluştu:', error);
  }
});


client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !message.content.startsWith(client.prefix)) return;
  
  const args = message.content.slice(client.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  
  const command = client.commands.get(commandName);
  
  if (!command) return;
  
  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(error);
    await message.reply('Komutu çalıştırırken bir hata oluştu!');
  }
});


client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  
  const command = client.slashCommands.get(interaction.commandName);
  
  if (!command) return;
  
  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Komutu çalıştırırken bir hata oluştu!', flags: 64 });
  }
});


const TARGET_USER_ID = process.env.TARGET_USER_ID;
const GUILD_ID = process.env.GUILD_ID; // .env dosyasından alınır
const TIMEOUT_DURATION = 7 * 24 * 60 * 60 * 1000; // 1 hafta (ms)
const INTERVAL = 1 * 60 * 1000; // 1 dakika (ms)

async function loopTimeoutUser() {
  try {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return;
    const member = await guild.members.fetch(TARGET_USER_ID).catch(() => null);
    if (!member) return;

    await member.timeout(TIMEOUT_DURATION, 'Otomatik sürekli timeout');
    console.log(`${member.user.tag} kullanıcısı otomatik olarak 1 hafta timeoutlandı.`);
  } catch (err) {
    console.error('Otomatik timeout sırasında hata:', err);
  }
}

client.once('ready', () => {
  loopTimeoutUser();
  setInterval(loopTimeoutUser, INTERVAL);
});


client.login(process.env.TOKEN);