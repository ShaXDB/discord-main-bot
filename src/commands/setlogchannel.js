const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { setLogChannel, removeLogChannel, LOG_TYPES, addLog, getLogChannel } = require('../database/logDatabase');
const { hasCommandPermission, logCommand } = require('../database/modDatabase');

module.exports = {
  name: 'setlogchannel',
  description: 'Belirli log türleri için log kanalı ayarlar',
  usage: 'setlogchannel <log_türü> <#kanal/ID/remove>',
  async execute(message, args, client) {
    try {

      const memberRoles = message.member.roles.cache.map(role => role.id);
      const hasPermission = await hasCommandPermission(message.guild.id, message.author.id, 'setlogchannel', memberRoles);
      
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator) && !hasPermission) {
        return message.reply('Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız!');
      }
      

      if (!args[0]) {
        const logTypesText = Object.keys(LOG_TYPES).map(type => `\`${LOG_TYPES[type]}\``).join(', ');
        return message.reply(`Lütfen bir log türü belirtin! Kullanılabilir log türleri: ${logTypesText}`);
      }
      
      if (!args[1]) {
        return message.reply('Lütfen bir kanal belirtin veya kanalı kaldırmak için `remove` yazın!');
      }
      

      const logType = args[0].toLowerCase();
      const validLogType = Object.values(LOG_TYPES).includes(logType);
      
      if (!validLogType) {
        const logTypesText = Object.keys(LOG_TYPES).map(type => `\`${LOG_TYPES[type]}\``).join(', ');
        return message.reply(`Geçersiz log türü! Kullanılabilir log türleri: ${logTypesText}`);
      }
      

      if (args[1].toLowerCase() === 'remove') {
        await removeLogChannel(message.guild.id, logType);
        

        await addLog(
          message.guild.id,
          LOG_TYPES.SERVER_UPDATE,
          message.author.id,
          message.guild.id,
          'Log Kanalı Kaldırıldı',
          { 
            log_type: logType
          }
        );
        

        const logChannelId = await getLogChannel(message.guild.id, LOG_TYPES.SERVER_UPDATE);
        if (logChannelId) {
          const logChannel = message.guild.channels.cache.get(logChannelId);
          if (logChannel) {
            const logEmbed = new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('Log Kanalı Kaldırıldı')
              .setDescription(`**${logType}** log türü için kanal kaldırıldı.`)
              .addFields(
                { name: 'Log Türü', value: logType, inline: true },
                { name: 'Yetkili', value: `${message.author.tag} (${message.author.id})`, inline: true }
              )
              .setTimestamp();
            
            await logChannel.send({ embeds: [logEmbed] });
          }
        }
        
        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('Log Kanalı Kaldırıldı')
          .setDescription(`**${logType}** log türü için kanal başarıyla kaldırıldı.`)
          .setTimestamp();
        
        await message.reply({ embeds: [embed] });
        

        await logCommand(message.guild.id, message.author.id, 'setlogchannel', { logType, action: 'remove' });
        return;
      }
      

      let channelId = args[1].replace(/[<#>]/g, '');
      const channel = message.guild.channels.cache.get(channelId);
      
      if (!channel) {
        return message.reply('Geçerli bir kanal belirtmelisiniz!');
      }
      

      await setLogChannel(message.guild.id, logType, channel.id);
      

      await addLog(
        message.guild.id,
        LOG_TYPES.SERVER_UPDATE,
        message.author.id,
        channel.id,
        'Log Kanalı Ayarlandı',
        { 
          log_type: logType,
          channel_name: channel.name,
          channel_id: channel.id
        }
      );
      

      const logChannelId = await getLogChannel(message.guild.id, LOG_TYPES.SERVER_UPDATE);
      if (logChannelId) {
        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Log Kanalı Ayarlandı')
            .setDescription(`**${logType}** log türü için <#${channel.id}> kanalı ayarlandı.`)
            .addFields(
              { name: 'Log Türü', value: logType, inline: true },
              { name: 'Kanal', value: `${channel.name} (${channel.id})`, inline: true },
              { name: 'Yetkili', value: `${message.author.tag} (${message.author.id})`, inline: true }
            )
            .setTimestamp();
          
          await logChannel.send({ embeds: [logEmbed] });
        }
      }
      
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Log Kanalı Ayarlandı')
        .setDescription(`**${logType}** log türü için <#${channel.id}> kanalı başarıyla ayarlandı.`)
        .setTimestamp();
      
      await message.reply({ embeds: [embed] });
      

      await logCommand(message.guild.id, message.author.id, 'setlogchannel', { logType, channelId: channel.id });
    } catch (error) {
      console.error('Log kanalı ayarlama hatası:', error);
      message.reply('Log kanalı ayarlanırken bir hata oluştu!');
    }
  }
};