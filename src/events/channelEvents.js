const { Events, EmbedBuilder, AuditLogEvent, ChannelType } = require('discord.js');
const { addLog, getLogChannel, LOG_TYPES } = require('../database/logDatabase');
require('dotenv').config();


module.exports = {
  name: Events.ChannelCreate,
  once: false,
  async execute(channel, client) {
    try {

      if (!channel.guild) return;
      
      const { guild } = channel;
      
      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.ChannelCreate
      });
      
      const auditLog = fetchedLogs.entries.first();
      if (!auditLog) return;
      
      const { executor } = auditLog;
      

      if (executor.id === client.user.id) return;
      

      let channelType = 'Bilinmeyen';
      switch (channel.type) {
        case ChannelType.GuildText:
          channelType = 'Metin Kanalı';
          break;
        case ChannelType.GuildVoice:
          channelType = 'Ses Kanalı';
          break;
        case ChannelType.GuildCategory:
          channelType = 'Kategori';
          break;
        case ChannelType.GuildAnnouncement:
          channelType = 'Duyuru Kanalı';
          break;
        case ChannelType.GuildStageVoice:
          channelType = 'Sahne Kanalı';
          break;
        case ChannelType.GuildForum:
          channelType = 'Forum Kanalı';
          break;
      }
      

      const permissions = channel.permissionOverwrites.cache.map(perm => {
        const target = perm.type === 0 ? `Rol: ${guild.roles.cache.get(perm.id)?.name || 'Silinmiş Rol'} (${perm.id})` : 
                      `Kullanıcı: ${guild.members.cache.get(perm.id)?.user || 'Bilinmeyen Kullanıcı'} (${perm.id})`;
        
        const allow = perm.allow.toArray().length > 0 ? `İzin Verilenler: ${perm.allow.toArray().join(', ')}` : '';
        const deny = perm.deny.toArray().length > 0 ? `Reddedilenler: ${perm.deny.toArray().join(', ')}` : '';
        
        return `${target}\n${allow}\n${deny}`.trim();
      });
      

      await addLog(
        guild.id,
        LOG_TYPES.CHANNEL_CREATE,
        executor.id,
        channel.id,
        'Kanal Oluşturuldu',
        { 
          channel_name: channel.name, 
          channel_id: channel.id, 
          channel_type: channelType,
          permissions: permissions
        }
      );
      

      const logChannelId = await getLogChannel(guild.id, LOG_TYPES.CHANNEL_CREATE);
      if (!logChannelId) return;
      
      const logChannel = guild.channels.cache.get(logChannelId);
      if (!logChannel) return;
      
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(`${process.env.SERVER_NAME} | Kanal Oluşturuldu`)
        .setDescription(`**${channelType}** türünde yeni bir kanal oluşturuldu.`)
        .addFields(
          { name: 'Kanal Adı', value: channel.name, inline: true },
          { name: 'Kanal ID', value: channel.id, inline: true },
          { name: 'Yetkili', value: `${executor} (${executor.id})`, inline: true }
        )
        .setTimestamp();
      

      if (permissions.length > 0) {
        embed.addFields({ name: 'Kanal İzinleri', value: permissions.join('\n\n').substring(0, 1024), inline: false });
      }
      
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Kanal oluşturma olayı loglanırken hata oluştu:', error);
    }
  },
};


const channelDelete = {
  name: Events.ChannelDelete,
  once: false,
  async execute(channel, client) {
    try {

      if (!channel.guild) return;
      
      const { guild } = channel;
      
      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.ChannelDelete
      });
      
      const auditLog = fetchedLogs.entries.first();
      if (!auditLog) return;
      
      const { executor } = auditLog;
      

      if (executor.id === client.user.id) return;
      

      let channelType = 'Bilinmeyen';
      switch (channel.type) {
        case ChannelType.GuildText:
          channelType = 'Metin Kanalı';
          break;
        case ChannelType.GuildVoice:
          channelType = 'Ses Kanalı';
          break;
        case ChannelType.GuildCategory:
          channelType = 'Kategori';
          break;
        case ChannelType.GuildAnnouncement:
          channelType = 'Duyuru Kanalı';
          break;
        case ChannelType.GuildStageVoice:
          channelType = 'Sahne Kanalı';
          break;
        case ChannelType.GuildForum:
          channelType = 'Forum Kanalı';
          break;
      }
      

      await addLog(
        guild.id,
        LOG_TYPES.CHANNEL_DELETE,
        executor.id,
        channel.id,
        'Kanal Silindi',
        { 
          channel_name: channel.name, 
          channel_id: channel.id, 
          channel_type: channelType
        }
      );
      

      const logChannelId = await getLogChannel(guild.id, LOG_TYPES.CHANNEL_DELETE);
      if (!logChannelId) return;
      
      const logChannel = guild.channels.cache.get(logChannelId);
      if (!logChannel) return;
      
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(`${process.env.SERVER_NAME} | Kanal Silindi`)
        .setDescription(`**${channelType}** türünde bir kanal silindi.`)
        .addFields(
          { name: 'Kanal Adı', value: channel.name, inline: true },
          { name: 'Kanal ID', value: channel.id, inline: true },
          { name: 'Yetkili', value: `${executor} (${executor.id})`, inline: true }
        )
        .setTimestamp();
      
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Kanal silme olayı loglanırken hata oluştu:', error);
    }
  },
};


const channelUpdate = {
  name: Events.ChannelUpdate,
  once: false,
  async execute(oldChannel, newChannel, client) {
    try {

      if (!newChannel.guild) return;
      
      
      if (
        oldChannel.name === newChannel.name &&
        oldChannel.topic === newChannel.topic &&
        oldChannel.nsfw === newChannel.nsfw &&
        oldChannel.rateLimitPerUser === newChannel.rateLimitPerUser &&
        oldChannel.bitrate === newChannel.bitrate &&
        oldChannel.userLimit === newChannel.userLimit &&
        JSON.stringify([...oldChannel.permissionOverwrites.cache]) === JSON.stringify([...newChannel.permissionOverwrites.cache])
      ) {
        return; 
      }
      
      const { guild } = newChannel;
      
      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.ChannelUpdate
      });
      
      const auditLog = fetchedLogs.entries.first();
      if (!auditLog) return;
      
      const { executor } = auditLog;
      
      
      if (executor.id === client.user.id) return;
      
      
      let channelType = 'Bilinmeyen';
      switch (newChannel.type) {
        case ChannelType.GuildText:
          channelType = 'Metin Kanalı';
          break;
        case ChannelType.GuildVoice:
          channelType = 'Ses Kanalı';
          break;
        case ChannelType.GuildCategory:
          channelType = 'Kategori';
          break;
        case ChannelType.GuildAnnouncement:
          channelType = 'Duyuru Kanalı';
          break;
        case ChannelType.GuildStageVoice:
          channelType = 'Sahne Kanalı';
          break;
        case ChannelType.GuildForum:
          channelType = 'Forum Kanalı';
          break;
      }
      
      const changes = [];
      
      
      if (oldChannel.name !== newChannel.name) {
        changes.push(`**Kanal Adı:** ${oldChannel.name} -> ${newChannel.name}`);
      }
      
      
      if (oldChannel.topic !== newChannel.topic) {
        changes.push(`**Kanal Konusu:** ${oldChannel.topic || 'Yok'} -> ${newChannel.topic || 'Yok'}`);
      }
      
      
      if (oldChannel.nsfw !== newChannel.nsfw) {
        changes.push(`**NSFW:** ${oldChannel.nsfw ? 'Evet' : 'Hayır'} -> ${newChannel.nsfw ? 'Evet' : 'Hayır'}`);
      }
      
      
      if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
        changes.push(`**Yavaş Mod:** ${oldChannel.rateLimitPerUser || '0'} -> ${newChannel.rateLimitPerUser || '0'} saniye`);
      }
      
      
      if (oldChannel.bitrate !== newChannel.bitrate) {
        changes.push(`**Bitrate:** ${oldChannel.bitrate || '0'} -> ${newChannel.bitrate || '0'} bps`);
      }
      
      
      if (oldChannel.userLimit !== newChannel.userLimit) {
        changes.push(`**Kullanıcı Limiti:** ${oldChannel.userLimit || 'Sınırsız'} -> ${newChannel.userLimit || 'Sınırsız'}`);
      }
      
      
      const oldPermissions = oldChannel.permissionOverwrites.cache;
      const newPermissions = newChannel.permissionOverwrites.cache;
    
      const addedPermissions = newPermissions.filter(perm => !oldPermissions.has(perm.id));
      if (addedPermissions.size > 0) {
        for (const [id, perm] of addedPermissions) {
          const target = perm.type === 0 ? `Rol: ${guild.roles.cache.get(perm.id)?.name || 'Silinmiş Rol'} (${perm.id})` : 
                        `Kullanıcı: ${guild.members.cache.get(perm.id)?.user || 'Bilinmeyen Kullanıcı'} (${perm.id})`;
          
          const allow = perm.allow.toArray().length > 0 ? `İzin Verilenler: ${perm.allow.toArray().join(', ')}` : '';
          const deny = perm.deny.toArray().length > 0 ? `Reddedilenler: ${perm.deny.toArray().join(', ')}` : '';
          
          changes.push(`**Eklenen İzin:** ${target}\n${allow}\n${deny}`.trim());
        }
      }
    
      const removedPermissions = oldPermissions.filter(perm => !newPermissions.has(perm.id));
      if (removedPermissions.size > 0) {
        for (const [id, perm] of removedPermissions) {
          const target = perm.type === 0 ? `Rol: ${guild.roles.cache.get(perm.id)?.name || 'Silinmiş Rol'} (${perm.id})` : 
                        `Kullanıcı: ${guild.members.cache.get(perm.id)?.user || 'Bilinmeyen Kullanıcı'} (${perm.id})`;
          
          changes.push(`**Kaldırılan İzin:** ${target}`);
        }
      }
      
      
      const updatedPermissions = newPermissions.filter(perm => {
        const oldPerm = oldPermissions.get(perm.id);
        return oldPerm && (!perm.allow.equals(oldPerm.allow) || !perm.deny.equals(oldPerm.deny));
      });
      
      if (updatedPermissions.size > 0) {
        for (const [id, perm] of updatedPermissions) {
          const oldPerm = oldPermissions.get(perm.id);
          const target = perm.type === 0 ? `Rol: ${guild.roles.cache.get(perm.id)?.name || 'Silinmiş Rol'} (${perm.id})` : 
                        `Kullanıcı: ${guild.members.cache.get(perm.id)?.user || 'Bilinmeyen Kullanıcı'} (${perm.id})`;
          
          const oldAllow = oldPerm.allow.toArray().length > 0 ? `Eski İzin Verilenler: ${oldPerm.allow.toArray().join(', ')}` : '';
          const oldDeny = oldPerm.deny.toArray().length > 0 ? `Eski Reddedilenler: ${oldPerm.deny.toArray().join(', ')}` : '';
          
          const newAllow = perm.allow.toArray().length > 0 ? `Yeni İzin Verilenler: ${perm.allow.toArray().join(', ')}` : '';
          const newDeny = perm.deny.toArray().length > 0 ? `Yeni Reddedilenler: ${perm.deny.toArray().join(', ')}` : '';
          
          changes.push(`**Değiştirilen İzin:** ${target}\n${oldAllow}\n${oldDeny}\n${newAllow}\n${newDeny}`.trim());
        }
      }
    
      await addLog(
        guild.id,
        LOG_TYPES.CHANNEL_UPDATE,
        executor.id,
        newChannel.id,
        'Kanal Güncellendi',
        { 
          channel_name: newChannel.name, 
          channel_id: newChannel.id, 
          channel_type: channelType,
          changes: changes
        }
      );
      
      
      const logChannelId = await getLogChannel(guild.id, LOG_TYPES.CHANNEL_UPDATE);
      if (!logChannelId) return;
      
      const logChannel = guild.channels.cache.get(logChannelId);
      if (!logChannel) return;
      
      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle(`${process.env.SERVER_NAME} | Kanal Güncellendi`)
        .setDescription(`**${channelType}** türünde bir kanal güncellendi.`)
        .addFields(
          { name: 'Kanal Adı', value: newChannel.name, inline: true },
          { name: 'Kanal ID', value: newChannel.id, inline: true },
          { name: 'Yetkili', value: `${executor} (${executor.id})`, inline: true }
        )
        .setTimestamp();
      
      
      if (changes.length > 0) {

        const chunkedChanges = [];
        let currentChunk = '';
        
        for (const change of changes) {
          if (currentChunk.length + change.length + 1 > 1024) {
            chunkedChanges.push(currentChunk);
            currentChunk = change;
          } else {
            currentChunk += (currentChunk ? '\n' : '') + change;
          }
        }
        
        if (currentChunk) {
          chunkedChanges.push(currentChunk);
        }
        

        chunkedChanges.forEach((chunk, index) => {
          embed.addFields({ name: index === 0 ? 'Yapılan Değişiklikler' : '\u200B', value: chunk, inline: false });
        });
      }
      
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Kanal güncelleme olayı loglanırken hata oluştu:', error);
    }
  },
};

module.exports = [module.exports, channelDelete, channelUpdate];