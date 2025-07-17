const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { hasCommandPermission, logCommand } = require('../database/modDatabase');
const { addLog, getLogChannel, LOG_TYPES } = require('../database/logDatabase');

module.exports = {
  name: 'unban',
  description: 'Belirtilen kullanıcının sunucudan yasağını kaldırır',
  usage: 'unban <kullanıcı ID>',
  async execute(message, args, client) {
    try {

      const memberRoles = message.member.roles.cache.map(role => role.id);
      const hasPermission = await hasCommandPermission(message.guild.id, message.author.id, 'unban', memberRoles);
      
      if (!hasPermission) {
        return message.reply('Bu komutu kullanmak için gerekli yetkiye sahip değilsiniz!');
      }
      

      if (!args[0]) {
        return message.reply('Lütfen yasağı kaldırılacak bir kullanıcı ID belirtin!');
      }
      
      const userId = args[0];
      

      try {
        await message.guild.members.unban(userId);
        
  
        await logCommand(message.guild.id, message.author.id, 'unban', { userId });
        
  
        const user = await client.users.fetch(userId).catch(() => null);
        const userTag = user ? user.tag : userId;
        
  
        await addLog(
          message.guild.id,
          LOG_TYPES.UNBAN,
          message.author.id,
          userId,
          'Kullanıcı Yasağı Kaldırıldı',
          { 
            username: userTag
          }
        );
        
  
        const logChannelId = await getLogChannel(message.guild.id, LOG_TYPES.UNBAN);
        if (logChannelId) {
          const logChannel = message.guild.channels.cache.get(logChannelId);
          if (logChannel) {
            const logEmbed = new EmbedBuilder()
              .setColor('#00FF00')
              .setTitle('Kullanıcı Yasağı Kaldırıldı')
              .setDescription(`**${userTag}** kullanıcısının yasağı kaldırıldı.`)
              .addFields(
                { name: 'Kullanıcı ID', value: userId, inline: true },
                { name: 'Yetkili', value: `${message.author.tag} (${message.author.id})`, inline: true }
              )
              .setTimestamp();
            
            await logChannel.send({ embeds: [logEmbed] });
          }
        }
        
  
        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('Kullanıcı Yasağı Kaldırıldı')
          .setDescription(`**${userTag}** kullanıcısının yasağı kaldırıldı.`)
          .addFields(
            { name: 'Yasağı Kaldıran', value: `${message.author.tag}`, inline: true }
          )
          .setTimestamp();
        
        await message.reply({ embeds: [embed] });
        
      } catch (error) {
        if (error.code === 10026) {
          return message.reply('Bu kullanıcı zaten yasaklı değil!');
        }
        throw error;
      }
      
    } catch (error) {
      console.error('Unban komutu çalıştırılırken hata oluştu:', error);
      message.reply('Komut çalıştırılırken bir hata oluştu!');
    }
  },
};