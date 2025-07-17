const { Events } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
require('dotenv').config();

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    try {
  
      console.log(`${client.user.tag} ses kanalına bağlanmaya hazırlanıyor...`);
      
  
      await new Promise(resolve => setTimeout(resolve, 5000));
      
  
      const guildId = process.env.GUILD_ID; 
      const channelId = process.env.VOICE_CHANNEL_ID;
      
  
      const guild = client.guilds.cache.get(guildId);
      
      if (!guild) {
        console.error(`Sunucu bulunamadı: ${guildId}`);
        return;
      }
      
  
      const channel = guild.channels.cache.get(channelId);
      
      if (!channel) {
        console.error(`Ses kanalı bulunamadı: ${channelId}`);
        return;
      }
      
  
      try {
        joinVoiceChannel({
          channelId: channelId,
          guildId: guildId,
          adapterCreator: guild.voiceAdapterCreator,
        });
        
        console.log(`Bot başarıyla ${channel.name} kanalına bağlandı!`);
      } catch (error) {
        console.error('Ses kanalına bağlanırken bir hata oluştu:', error);
      }
    } catch (error) {
      console.error('Ses kanalına bağlanma olayı sırasında hata oluştu:', error);
    }
  },
};
