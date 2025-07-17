const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const { addLog, getLogChannel, LOG_TYPES } = require('../database/logDatabase');
require('dotenv').config();

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member, client) {
    try {

      await addLog(
        member.guild.id,
        LOG_TYPES.MEMBER_JOIN,
        member.id,
        member.guild.id,
        'Sunucuya Katıldı',
        { username: member.user }
      );


      const logChannelId = await getLogChannel(member.guild.id, LOG_TYPES.MEMBER_JOIN);
      if (!logChannelId) return;

      const logChannel = member.guild.channels.cache.get(logChannelId);
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(`${process.env.SERVER_NAME} | Üye Katıldı`)
        .setDescription(`**${member.user}** sunucuya katıldı.`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Kullanıcı ID', value: member.id, inline: true },
          { name: 'Hesap Oluşturulma Tarihi', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Üye katılma olayı loglanırken hata oluştu:', error);
    }
  },
};


const guildMemberRemove = {
  name: Events.GuildMemberRemove,
  once: false,
  async execute(member, client) {
    try {

      await addLog(
        member.guild.id,
        LOG_TYPES.MEMBER_LEAVE,
        member.id,
        member.guild.id,
        'Sunucudan Ayrıldı',
        { username: member.user }
      );


      const logChannelId = await getLogChannel(member.guild.id, LOG_TYPES.MEMBER_LEAVE);
      if (!logChannelId) return;

      const logChannel = member.guild.channels.cache.get(logChannelId);
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(`${process.env.SERVER_NAME} | Üye Ayrıldı`)
        .setDescription(`**${member.user}** sunucudan ayrıldı.`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Kullanıcı ID', value: member.id, inline: true },
          { name: 'Sunucuya Katılma Tarihi', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Üye ayrılma olayı loglanırken hata oluştu:', error);
    }
  },
};


const guildBanAdd = {
  name: Events.GuildBanAdd,
  once: false,
  async execute(ban, client) {
    try {
      const { guild, user } = ban;
      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: 22, 
      });
      
      const banLog = fetchedLogs.entries.first();
      const { executor } = banLog;
      

      if (executor.id === client.user.id) return;
      

      await addLog(
        guild.id,
        LOG_TYPES.BAN,
        executor.id,
        user.id,
        'Kullanıcı Yasaklandı',
        { reason: banLog.reason || 'Sebep belirtilmedi', username: user.tag }
      );


      const logChannelId = await getLogChannel(guild.id, LOG_TYPES.BAN);
      if (!logChannelId) return;

      const logChannel = guild.channels.cache.get(logChannelId);
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(`${process.env.SERVER_NAME} | Kullanıcı Yasaklandı`)
        .setDescription(`**${user.tag}** sunucudan yasaklandı.`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Kullanıcı ID', value: user.id, inline: true },
          { name: 'Yetkili', value: `${executor} (${executor.id})`, inline: true },
          { name: 'Sebep', value: banLog.reason || 'Sebep belirtilmedi', inline: false }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Ban olayı loglanırken hata oluştu:', error);
    }
  },
};


const guildBanRemove = {
  name: Events.GuildBanRemove,
  once: false,
  async execute(ban, client) {
    try {
      const { guild, user } = ban;
      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: 23,
      });
      
      const unbanLog = fetchedLogs.entries.first();
      const { executor } = unbanLog;
      

      if (executor.id === client.user.id) return;
      

      await addLog(
        guild.id,
        LOG_TYPES.UNBAN,
        executor.id,
        user.id,
        'Kullanıcı Yasağı Kaldırıldı',
        { username: user }
      );

 
      const logChannelId = await getLogChannel(guild.id, LOG_TYPES.UNBAN);
      if (!logChannelId) return;

      const logChannel = guild.channels.cache.get(logChannelId);
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(`${process.env.SERVER_NAME} | Kullanıcı Yasağı Kaldırıldı`)
        .setDescription(`**${user.tag}** kullanıcısının yasağı kaldırıldı.`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Kullanıcı ID', value: user.id, inline: true },
          { name: 'Yetkili', value: `${executor} (${executor.id})`, inline: true }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Unban olayı loglanırken hata oluştu:', error);
    }
  },
};

module.exports = [module.exports, guildMemberRemove, guildBanAdd, guildBanRemove];