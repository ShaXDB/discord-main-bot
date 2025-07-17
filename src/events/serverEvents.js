const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const { addLog, getLogChannel, LOG_TYPES } = require('../database/logDatabase');
require('dotenv').config();


module.exports = {
  name: Events.GuildUpdate,
  once: false,
  async execute(oldGuild, newGuild, client) {
    try {
      
      if (
        oldGuild.name === newGuild.name &&
        oldGuild.iconURL() === newGuild.iconURL() &&
        oldGuild.bannerURL() === newGuild.bannerURL() &&
        oldGuild.description === newGuild.description &&
        oldGuild.vanityURLCode === newGuild.vanityURLCode
      ) {
        return; 
      }

      const fetchedLogs = await newGuild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.GuildUpdate
      });

      const auditLog = fetchedLogs.entries.first();
      if (!auditLog) return;

      const { executor } = auditLog;

      
      if (executor.id === client.user.id) return;

      const changes = [];


      if (oldGuild.name !== newGuild.name) {
        changes.push(`**Sunucu Adı:** ${oldGuild.name} -> ${newGuild.name}`);
      }

      
      if (oldGuild.iconURL() !== newGuild.iconURL()) {
        changes.push('**Sunucu Simgesi** değiştirildi.');
      }

      
      if (oldGuild.bannerURL() !== newGuild.bannerURL()) {
        changes.push('**Sunucu Banner\'ı** değiştirildi.');
      }

      
      if (oldGuild.description !== newGuild.description) {
        changes.push(`**Sunucu Açıklaması:** ${oldGuild.description || 'Yok'} -> ${newGuild.description || 'Yok'}`);
      }


      if (oldGuild.vanityURLCode !== newGuild.vanityURLCode) {
        changes.push(`**Özel URL:** ${oldGuild.vanityURLCode || 'Yok'} -> ${newGuild.vanityURLCode || 'Yok'}`);
      }


      await addLog(
        newGuild.id,
        LOG_TYPES.SERVER_UPDATE,
        executor.id,
        newGuild.id,
        'Sunucu Güncellendi',
        { changes }
      );

      
      const logChannelId = await getLogChannel(newGuild.id, LOG_TYPES.SERVER_UPDATE);
      if (!logChannelId) return;

      const logChannel = newGuild.channels.cache.get(logChannelId);
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle(`${process.env.SERVER_NAME} | Sunucu Güncellendi`)
        .setDescription(`Sunucu ayarları **${executor}** tarafından güncellendi.`)
        .addFields(
          { name: 'Yetkili', value: `${executor} (${executor.id})`, inline: true },
          { name: 'Yapılan Değişiklikler', value: changes.join('\n') || 'Bilinmeyen değişiklik', inline: false }
        )
        .setTimestamp();

      if (newGuild.iconURL()) {
        embed.setThumbnail(newGuild.iconURL({ dynamic: true }));
      }

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Sunucu güncelleme olayı loglanırken hata oluştu:', error);
    }
  },
};


const emojiCreate = {
  name: Events.GuildEmojiCreate,
  once: false,
  async execute(emoji, client) {
    try {
      const { guild } = emoji;

      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.EmojiCreate
      });

      const auditLog = fetchedLogs.entries.first();
      if (!auditLog) return;

      const { executor } = auditLog;

      
      if (executor.id === client.user.id) return;


      await addLog(
        guild.id,
        LOG_TYPES.SERVER_UPDATE,
        executor.id,
        emoji.id,
        'Emoji Eklendi',
        { emoji_name: emoji.name, emoji_id: emoji.id, emoji_url: emoji.url }
      );

      
      const logChannelId = await getLogChannel(guild.id, LOG_TYPES.SERVER_UPDATE);
      if (!logChannelId) return;

      const logChannel = guild.channels.cache.get(logChannelId);
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(`${process.env.SERVER_NAME} | Emoji Eklendi`)
        .setDescription(`Yeni bir emoji **${executor}** tarafından eklendi.`)
        .setThumbnail(emoji.url)
        .addFields(
          { name: 'Emoji Adı', value: emoji.name, inline: true },
          { name: 'Emoji ID', value: emoji.id, inline: true },
          { name: 'Yetkili', value: `${executor} (${executor.id})`, inline: true }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Emoji ekleme olayı loglanırken hata oluştu:', error);
    }
  },
};

const emojiDelete = {
  name: Events.GuildEmojiDelete,
  once: false,
  async execute(emoji, client) {
    try {
      const { guild } = emoji;

      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.EmojiDelete
      });

      const auditLog = fetchedLogs.entries.first();
      if (!auditLog) return;

      const { executor } = auditLog;

      
      if (executor.id === client.user.id) return;


      await addLog(
        guild.id,
        LOG_TYPES.SERVER_UPDATE,
        executor.id,
        emoji.id,
        'Emoji Silindi',
        { emoji_name: emoji.name, emoji_id: emoji.id }
      );

      
      const logChannelId = await getLogChannel(guild.id, LOG_TYPES.SERVER_UPDATE);
      if (!logChannelId) return;

      const logChannel = guild.channels.cache.get(logChannelId);
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(`${process.env.SERVER_NAME} | Emoji Silindi`)
        .setDescription(`Bir emoji **${executor}** tarafından silindi.`)
        .addFields(
          { name: 'Emoji Adı', value: emoji.name, inline: true },
          { name: 'Emoji ID', value: emoji.id, inline: true },
          { name: 'Yetkili', value: `${executor} (${executor.id})`, inline: true }
        )
        .setTimestamp();

      if (emoji.url) {
        embed.setThumbnail(emoji.url);
      }

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Emoji silme olayı loglanırken hata oluştu:', error);
    }
  },
};


const stickerCreate = {
  name: Events.GuildStickerCreate,
  once: false,
  async execute(sticker, client) {
    try {
      const { guild } = sticker;

      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.StickerCreate
      });

      const auditLog = fetchedLogs.entries.first();
      if (!auditLog) return;

      const { executor } = auditLog;

      
      if (executor.id === client.user.id) return;


      await addLog(
        guild.id,
        LOG_TYPES.SERVER_UPDATE,
        executor.id,
        sticker.id,
        'Sticker Eklendi',
        { sticker_name: sticker.name, sticker_id: sticker.id, sticker_url: sticker.url }
      );

      
      const logChannelId = await getLogChannel(guild.id, LOG_TYPES.SERVER_UPDATE);
      if (!logChannelId) return;

      const logChannel = guild.channels.cache.get(logChannelId);
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(`${process.env.SERVER_NAME} | Sticker Eklendi`)
        .setDescription(`Yeni bir sticker **${executor}** tarafından eklendi.`)
        .setThumbnail(sticker.url)
        .addFields(
          { name: 'Sticker Adı', value: sticker.name, inline: true },
          { name: 'Sticker ID', value: sticker.id, inline: true },
          { name: 'Yetkili', value: `${executor} (${executor.id})`, inline: true },
          { name: 'Açıklama', value: sticker.description || 'Açıklama yok', inline: false }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Sticker ekleme olayı loglanırken hata oluştu:', error);
    }
  },
};

const stickerDelete = {
  name: Events.GuildStickerDelete,
  once: false,
  async execute(sticker, client) {
    try {
      const { guild } = sticker;

      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.StickerDelete
      });

      const auditLog = fetchedLogs.entries.first();
      if (!auditLog) return;

      const { executor } = auditLog;

      
      if (executor.id === client.user.id) return;


      await addLog(
        guild.id,
        LOG_TYPES.SERVER_UPDATE,
        executor.id,
        sticker.id,
        'Sticker Silindi',
        { sticker_name: sticker.name, sticker_id: sticker.id }
      );

      
      const logChannelId = await getLogChannel(guild.id, LOG_TYPES.SERVER_UPDATE);
      if (!logChannelId) return;

      const logChannel = guild.channels.cache.get(logChannelId);
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(`${process.env.SERVER_NAME} | Sticker Silindi`)
        .setDescription(`Bir sticker **${executor}** tarafından silindi.`)
        .addFields(
          { name: 'Sticker Adı', value: sticker.name, inline: true },
          { name: 'Sticker ID', value: sticker.id, inline: true },
          { name: 'Yetkili', value: `${executor} (${executor.id})`, inline: true }
        )
        .setTimestamp();

      if (sticker.url) {
        embed.setThumbnail(sticker.url);
      }

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Sticker silme olayı loglanırken hata oluştu:', error);
    }
  },
};

module.exports = [module.exports, emojiCreate, emojiDelete, stickerCreate, stickerDelete];