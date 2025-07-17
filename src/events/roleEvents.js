require('dotenv').config();
const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const { addLog, getLogChannel, LOG_TYPES } = require('../database/logDatabase');


module.exports = {
  name: Events.GuildRoleCreate,
  once: false,
  async execute(role, client) {
    try {
      const { guild } = role;
      
      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.RoleCreate
      });
      
      const auditLog = fetchedLogs.entries.first();
      if (!auditLog) return;
      
      const { executor } = auditLog;
      
      
      if (executor.id === client.user.id) return;
    
      const permissions = role.permissions.toArray();
    
      await addLog(
        guild.id,
        LOG_TYPES.ROLE_CREATE,
        executor.id,
        role.id,
        'Rol Oluşturuldu',
        { 
          role_name: role.name, 
          role_id: role.id, 
          role_color: role.hexColor,
          permissions: permissions
        }
      );
    
      const logChannelId = await getLogChannel(guild.id, LOG_TYPES.ROLE_CREATE);
      if (!logChannelId) return;
      
      const logChannel = guild.channels.cache.get(logChannelId);
      if (!logChannel) return;
      
      const embed = new EmbedBuilder()
        .setColor(role.hexColor || '#00FF00')
        .setTitle(`${process.env.SERVER_NAME} | Rol Oluşturuldu`)
        .setDescription(`Yeni bir rol oluşturuldu.`)
        .addFields(
          { name: 'Rol Adı', value: role.name, inline: true },
          { name: 'Rol ID', value: role.id, inline: true },
          { name: 'Yetkili', value: `${executor} (${executor.id})`, inline: true },
          { name: 'Renk', value: role.hexColor, inline: true },
          { name: 'Pozisyon', value: `${role.position}`, inline: true },
          { name: 'Etiketlenebilir', value: role.mentionable ? 'Evet' : 'Hayır', inline: true }
        )
        .setTimestamp();
    
      if (permissions.length > 0) {
        embed.addFields({ name: 'Rol İzinleri', value: permissions.join(', ').substring(0, 1024), inline: false });
      }
      
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Rol oluşturma olayı loglanırken hata oluştu:', error);
    }
  },
};


const roleDelete = {
  name: Events.GuildRoleDelete,
  once: false,
  async execute(role, client) {
    try {
      const { guild } = role;
      
      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.RoleDelete
      });
      
      const auditLog = fetchedLogs.entries.first();
      if (!auditLog) return;
      
      const { executor } = auditLog;
      
      
      if (executor.id === client.user.id) return;
    
      await addLog(
        guild.id,
        LOG_TYPES.ROLE_DELETE,
        executor.id,
        role.id,
        'Rol Silindi',
        { 
          role_name: role.name, 
          role_id: role.id, 
          role_color: role.hexColor
        }
      );
    
      const logChannelId = await getLogChannel(guild.id, LOG_TYPES.ROLE_DELETE);
      if (!logChannelId) return;
      
      const logChannel = guild.channels.cache.get(logChannelId);
      if (!logChannel) return;
      
      const embed = new EmbedBuilder()
        .setColor(role.hexColor || '#FF0000')
        .setTitle(`${process.env.SERVER_NAME} | Rol Silindi`)
        .setDescription(`Bir rol silindi.`)
        .addFields(
          { name: 'Rol Adı', value: role.name, inline: true },
          { name: 'Rol ID', value: role.id, inline: true },
          { name: 'Yetkili', value: `${executor} (${executor.id})`, inline: true },
          { name: 'Renk', value: role.hexColor, inline: true },
          { name: 'Pozisyon', value: `${role.position}`, inline: true }
        )
        .setTimestamp();
      
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Rol silme olayı loglanırken hata oluştu:', error);
    }
  },
};


const roleUpdate = {
  name: Events.GuildRoleUpdate,
  once: false,
  async execute(oldRole, newRole, client) {
    try {
      
      if (
        oldRole.name === newRole.name &&
        oldRole.hexColor === newRole.hexColor &&
        oldRole.hoist === newRole.hoist &&
        oldRole.mentionable === newRole.mentionable &&
        oldRole.permissions.bitfield === newRole.permissions.bitfield
      ) {
        return; 
      }
      
      const { guild } = newRole;
      
      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.RoleUpdate
      });
      
      const auditLog = fetchedLogs.entries.first();
      if (!auditLog) return;
      
      const { executor } = auditLog;
      
      
      if (executor.id === client.user.id) return;
      
      const changes = [];
    
      if (oldRole.name !== newRole.name) {
        changes.push(`**Rol Adı:** ${oldRole.name} -> ${newRole.name}`);
      }
    
      if (oldRole.hexColor !== newRole.hexColor) {
        changes.push(`**Rol Rengi:** ${oldRole.hexColor} -> ${newRole.hexColor}`);
      }
    
      if (oldRole.hoist !== newRole.hoist) {
        changes.push(`**Üyeleri Ayrı Göster:** ${oldRole.hoist ? 'Evet' : 'Hayır'} -> ${newRole.hoist ? 'Evet' : 'Hayır'}`);
      }
    
      if (oldRole.mentionable !== newRole.mentionable) {
        changes.push(`**Etiketlenebilir:** ${oldRole.mentionable ? 'Evet' : 'Hayır'} -> ${newRole.mentionable ? 'Evet' : 'Hayır'}`);
      }
    
      if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
        const oldPermissions = oldRole.permissions.toArray();
        const newPermissions = newRole.permissions.toArray();
        

        const addedPermissions = newPermissions.filter(perm => !oldPermissions.includes(perm));
        if (addedPermissions.length > 0) {
          changes.push(`**Eklenen İzinler:** ${addedPermissions.join(', ')}`);
        }
        

        const removedPermissions = oldPermissions.filter(perm => !newPermissions.includes(perm));
        if (removedPermissions.length > 0) {
          changes.push(`**Kaldırılan İzinler:** ${removedPermissions.join(', ')}`);
        }
      }
    
      await addLog(
        guild.id,
        LOG_TYPES.ROLE_UPDATE,
        executor.id,
        newRole.id,
        'Rol Güncellendi',
        { 
          role_name: newRole.name, 
          role_id: newRole.id, 
          role_color: newRole.hexColor,
          changes: changes
        }
      );
    
      const logChannelId = await getLogChannel(guild.id, LOG_TYPES.ROLE_UPDATE);
      if (!logChannelId) return;
      
      const logChannel = guild.channels.cache.get(logChannelId);
      if (!logChannel) return;
      
      const embed = new EmbedBuilder()
        .setColor(newRole.hexColor || '#FFA500')
        .setTitle(`${process.env.SERVER_NAME} | Rol Güncellendi`)
        .setDescription(`Bir rol güncellendi.`)
        .addFields(
          { name: 'Rol Adı', value: newRole.name, inline: true },
          { name: 'Rol ID', value: newRole.id, inline: true },
          { name: 'Yetkili', value: `${executor} (${executor.id})`, inline: true }
        )
        .setTimestamp();
    
      if (changes.length > 0) {
        embed.addFields({ name: 'Yapılan Değişiklikler', value: changes.join('\n').substring(0, 1024), inline: false });
      }
      
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Rol güncelleme olayı loglanırken hata oluştu:', error);
    }
  },
};

module.exports = [module.exports, roleDelete, roleUpdate];