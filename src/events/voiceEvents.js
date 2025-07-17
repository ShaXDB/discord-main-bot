const { Events, EmbedBuilder } = require('discord.js');
const { addLog, getLogChannel, LOG_TYPES } = require('../database/logDatabase');
require('dotenv').config();


module.exports = {
  name: Events.VoiceStateUpdate,
  once: false,
  async execute(oldState, newState, client) {
    try {

      if (oldState.member.user.bot || newState.member.user.bot) return;
      
      const guild = oldState.guild || newState.guild;
      const member = oldState.member || newState.member;
      

      const logChannelId = await getLogChannel(guild.id, LOG_TYPES.VOICE_LOG);
      if (!logChannelId) return;
      
      const logChannel = guild.channels.cache.get(logChannelId);
      if (!logChannel) return;
      
      const embed = new EmbedBuilder()
        .setAuthor({ 
          name: member.user.tag, 
          iconURL: member.user.displayAvatarURL({ dynamic: true }) 
        })
        .setFooter({ text: `Kullanıcı ID: ${member.id}` })
        .setTimestamp();
      

      if (!oldState.channelId && newState.channelId) {
        embed.setColor('#00FF00')
          .setTitle(`${process.env.SERVER_NAME} | Ses Kanalına Katıldı`)
          .setDescription(`**${member.user}** kullanıcısı <#${newState.channelId}> kanalına katıldı.`);
        
        await addLog(
          guild.id,
          LOG_TYPES.VOICE_LOG,
          member.id,
          newState.channelId,
          'Ses Kanalına Katıldı',
          { 
            username: member.user.tag,
            channel_name: newState.channel.name,
            channel_id: newState.channelId
          }
        );
      }

      else if (oldState.channelId && !newState.channelId) {
        embed.setColor('#FF0000')
          .setTitle(`${process.env.SERVER_NAME} | Ses Kanalından Ayrıldı`)
          .setDescription(`**${member.user}** kullanıcısı <#${oldState.channelId}> kanalından ayrıldı.`);
        
        await addLog(
          guild.id,
          LOG_TYPES.VOICE_LOG,
          member.id,
          oldState.channelId,
          'Ses Kanalından Ayrıldı',
          { 
            username: member.user.tag,
            channel_name: oldState.channel.name,
            channel_id: oldState.channelId
          }
        );
      }

      else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        embed.setColor('#FFA500')
          .setTitle(`${process.env.SERVER_NAME} | Ses Kanalı Değiştirildi`)
          .setDescription(`**${member.user}** kullanıcısı ses kanalını değiştirdi.`)
          .addFields(
            { name: 'Önceki Kanal', value: `<#${oldState.channelId}>`, inline: true },
            { name: 'Yeni Kanal', value: `<#${newState.channelId}>`, inline: true }
          );
        
        await addLog(
          guild.id,
          LOG_TYPES.VOICE_LOG,
          member.id,
          newState.channelId,
          'Ses Kanalı Değiştirildi',
          { 
            username: member.user.tag,
            old_channel_name: oldState.channel.name,
            old_channel_id: oldState.channelId,
            new_channel_name: newState.channel.name,
            new_channel_id: newState.channelId
          }
        );
      }
      else if (oldState.channelId && newState.channelId && oldState.channelId === newState.channelId) {
        return;
      }
      

      if (embed.data.description) {
        await logChannel.send({ embeds: [embed] });
      }
      
    } catch (error) {
      console.error('Ses kanalı olayı loglanırken hata oluştu:', error);
    }
  },
};