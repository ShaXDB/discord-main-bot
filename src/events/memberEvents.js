const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const { addLog, getLogChannel, LOG_TYPES } = require('../database/logDatabase');
require('dotenv').config();

module.exports = {
  name: Events.GuildMemberUpdate,
  once: false,
  async execute(oldMember, newMember, client) {
    try {
      const { guild } = newMember;
      
      
      if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
        const fetchedLogs = await guild.fetchAuditLogs({
          limit: 1,
          type: AuditLogEvent.MemberUpdate
        });
        
        const auditLog = fetchedLogs.entries.first();
        if (!auditLog) return;
        
        const { executor, target } = auditLog;
        

        if (executor.id === client.user.id) return;
        

        if (!oldMember.communicationDisabledUntilTimestamp && newMember.communicationDisabledUntilTimestamp) {
          await addLog(
            guild.id,
            LOG_TYPES.TIMEOUT,
            executor.id,
            target.id,
            'Kullanıcı Susturuldu',
            { 
              username: target.tag,
              duration: newMember.communicationDisabledUntilTimestamp - Date.now(),
              reason: auditLog.reason || 'Sebep belirtilmedi'
            }
          );
          
  
          const logChannelId = await getLogChannel(guild.id, LOG_TYPES.TIMEOUT);
          if (logChannelId) {
            const logChannel = guild.channels.cache.get(logChannelId);
            if (logChannel) {
              const embed = new EmbedBuilder()
                .setColor('#FF9900')
                .setTitle(`${process.env.SERVER_NAME} | Kullanıcı Susturuldu`)
                .setDescription(`**${target}** kullanıcısı susturuldu.`)
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .addFields(
                  { name: 'Kullanıcı ID', value: target.id, inline: true },
                  { name: 'Yetkili', value: `${executor} (${executor.id})`, inline: true },
                  { name: 'Süre', value: `<t:${Math.floor(newMember.communicationDisabledUntilTimestamp / 1000)}:R>`, inline: true },
                  { name: 'Sebep', value: auditLog.reason || 'Sebep belirtilmedi', inline: false }
                )
                .setTimestamp();
              
              await logChannel.send({ embeds: [embed] });
            }
          }
        }

        else if (oldMember.communicationDisabledUntilTimestamp && !newMember.communicationDisabledUntilTimestamp) {
          await addLog(
            guild.id,
            LOG_TYPES.UNTIMEOUT,
            executor.id,
            target.id,
            'Kullanıcı Susturması Kaldırıldı',
            { username: target.tag }
          );
          
  
          const logChannelId = await getLogChannel(guild.id, LOG_TYPES.UNTIMEOUT);
          if (logChannelId) {
            const logChannel = guild.channels.cache.get(logChannelId);
            if (logChannel) {
              const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle(`${process.env.SERVER_NAME} | Kullanıcı Susturması Kaldırıldı`)
                .setDescription(`**${target}** kullanıcısının susturması kaldırıldı.`)
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .addFields(
                  { name: 'Kullanıcı ID', value: target.id, inline: true },
                  { name: 'Yetkili', value: `${executor} (${executor.id})`, inline: true }
                )
                .setTimestamp();
              
              await logChannel.send({ embeds: [embed] });
            }
          }
        }
      }
    
      if (!oldMember.roles.cache.equals(newMember.roles.cache)) {
        const fetchedLogs = await guild.fetchAuditLogs({
          limit: 1,
          type: AuditLogEvent.MemberRoleUpdate
        });
        
        const auditLog = fetchedLogs.entries.first();
        if (!auditLog) return;
        
        const { executor, target } = auditLog;
        

        if (executor.id === client.user.id) return;
        

        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
        if (addedRoles.size > 0) {
          for (const [id, role] of addedRoles) {
            await addLog(
              guild.id,
              LOG_TYPES.MEMBER_ROLE_ADD,
              executor.id,
              target.id,
              'Kullanıcıya Rol Eklendi',
              { username: target.tag, role_name: role.name, role_id: role.id }
            );
          }
          
  
          const logChannelId = await getLogChannel(guild.id, LOG_TYPES.MEMBER_ROLE_ADD);
          if (logChannelId) {
            const logChannel = guild.channels.cache.get(logChannelId);
            if (logChannel) {
              const embed = new EmbedBuilder()
                .setColor('#00FFFF')
                .setTitle(`${process.env.SERVER_NAME} | Kullanıcıya Rol Eklendi`)
                .setDescription(`**${target}** kullanıcısına rol eklendi.`)
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .addFields(
                  { name: 'Kullanıcı ID', value: target.id, inline: true },
                  { name: 'Yetkili', value: `${executor} (${executor.id})`, inline: true },
                  { name: 'Eklenen Roller', value: addedRoles.map(r => `${r.name} (${r.id})`).join('\n'), inline: false }
                )
                .setTimestamp();
              
              await logChannel.send({ embeds: [embed] });
            }
          }
        }
        

        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
        if (removedRoles.size > 0) {
          for (const [id, role] of removedRoles) {
            await addLog(
              guild.id,
              LOG_TYPES.MEMBER_ROLE_REMOVE,
              executor.id,
              target.id,
              'Kullanıcıdan Rol Çıkarıldı',
              { username: target.tag, role_name: role.name, role_id: role.id }
            );
          }
          
  
          const logChannelId = await getLogChannel(guild.id, LOG_TYPES.MEMBER_ROLE_REMOVE);
          if (logChannelId) {
            const logChannel = guild.channels.cache.get(logChannelId);
            if (logChannel) {
              const embed = new EmbedBuilder()
                .setColor('#FF00FF')
                .setTitle(`${process.env.SERVER_NAME} | Kullanıcıdan Rol Çıkarıldı`)
                .setDescription(`**${target}** kullanıcısından rol çıkarıldı.`)
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .addFields(
                  { name: 'Kullanıcı ID', value: target.id, inline: true },
                  { name: 'Yetkili', value: `${executor} (${executor.id})`, inline: true },
                  { name: 'Çıkarılan Roller', value: removedRoles.map(r => `${r.name} (${r.id})`).join('\n'), inline: false }
                )
                .setTimestamp();
              
              await logChannel.send({ embeds: [embed] });
            }
          }
        }
      }
    } catch (error) {
      console.error('Üye güncelleme olayı loglanırken hata oluştu:', error);
    }
  },
};