const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { addCommandPermission, removeCommandPermission, getCommandPermissions } = require('../database/modDatabase');
const { logCommand } = require('../database/modDatabase');
const { addLog, getLogChannel, LOG_TYPES } = require('../database/logDatabase');

module.exports = {
  name: 'setcommandrole',
  description: 'Belirli komutlar için yetkilendirilmiş rolleri ayarlar',
  usage: 'setcommandrole <komut> <@rol> [kaldır]',
  aliases: ['scr', 'komutrol'],
  
  async execute(message, args, client) {
    try {

      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply('Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız!');
      }
      

      if (args.length < 2) {
        return message.reply(`Doğru kullanım: \`${this.usage}\``);
      }
      

      const commandName = args[0].toLowerCase();
      const roleMention = args[1];
      const remove = args[2] === 'kaldır';
      

      let roleId;
      if (roleMention.startsWith('<@&') && roleMention.endsWith('>')) {
        roleId = roleMention.slice(3, -1);
      } else {
        return message.reply('Lütfen geçerli bir rol etiketleyin!');
      }
      

      const role = message.guild.roles.cache.get(roleId);
      if (!role) {
        return message.reply('Belirtilen rol bulunamadı!');
      }
      

      const validCommands = ['ban', 'unban', 'timeout', 'untimeout', 'setlogchannel', 'setcommandrole', 'warn'];
      if (!validCommands.includes(commandName)) {
        return message.reply(`Geçersiz komut adı! Geçerli komutlar: ${validCommands.join(', ')}`);
      }
      

      if (remove) {
        const removed = await removeCommandPermission(message.guild.id, commandName, roleId);
        
        if (!removed) {
          return message.reply(`**${role.name}** rolü zaten **${commandName}** komutu için yetkilendirilmemiş!`);
        }
        

        await addLog(
          message.guild.id,
          LOG_TYPES.SERVER_UPDATE,
          message.author.id,
          role.id,
          'Komut Rolü Kaldırıldı',
          { 
            command_name: commandName,
            role_name: role.name,
            role_id: role.id
          }
        );
        

        const logChannelId = await getLogChannel(message.guild.id, LOG_TYPES.SERVER_UPDATE);
        if (logChannelId) {
          const logChannel = message.guild.channels.cache.get(logChannelId);
          if (logChannel) {
            const logEmbed = new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('Komut Rolü Kaldırıldı')
              .setDescription(`**${commandName}** komutu için **${role.name}** rolünün yetkisi kaldırıldı.`)
              .addFields(
                { name: 'Komut', value: commandName, inline: true },
                { name: 'Rol', value: `${role.name} (${role.id})`, inline: true },
                { name: 'Yetkili', value: `${message.author.tag} (${message.author.id})`, inline: true }
              )
              .setTimestamp();
            
            await logChannel.send({ embeds: [logEmbed] });
          }
        }
        
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Komut Rolü Kaldırıldı')
          .setDescription(`**${commandName}** komutu için **${role.name}** rolünün yetkisi kaldırıldı.`)
          .setTimestamp();
        
        await message.reply({ embeds: [embed] });
        

        await logCommand(message.guild.id, message.author.id, 'setcommandrole', { 
          commandName, 
          roleId: role.id, 
          action: 'remove' 
        });
        return;
      }
      

      const added = await addCommandPermission(message.guild.id, commandName, roleId);
      
      if (!added) {
        return message.reply(`**${role.name}** rolü zaten **${commandName}** komutu için yetkilendirilmiş!`);
      }
    
      await addLog(
        message.guild.id,
        LOG_TYPES.SERVER_UPDATE,
        message.author.id,
        role.id,
        'Komut Rolü Eklendi',
        { 
          command_name: commandName,
          role_name: role.name,
          role_id: role.id
        }
      );
    
      const logChannelId = await getLogChannel(message.guild.id, LOG_TYPES.SERVER_UPDATE);
      if (logChannelId) {
        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Komut Rolü Eklendi')
            .setDescription(`**${commandName}** komutu için **${role.name}** rolü başarıyla yetkilendirildi.`)
            .addFields(
              { name: 'Komut', value: commandName, inline: true },
              { name: 'Rol', value: `${role.name} (${role.id})`, inline: true },
              { name: 'Yetkili', value: `${message.author.tag} (${message.author.id})`, inline: true }
            )
            .setTimestamp();
          
          await logChannel.send({ embeds: [logEmbed] });
        }
      }
      
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Komut Rolü Eklendi')
        .setDescription(`**${commandName}** komutu için **${role.name}** rolü başarıyla yetkilendirildi.`)
        .setTimestamp();
      
      await message.reply({ embeds: [embed] });
    
      await logCommand(message.guild.id, message.author.id, 'setcommandrole', { 
        commandName, 
        roleId: role.id, 
        action: 'add' 
      });
    } catch (error) {
      console.error('Komut rolü ayarlama hatası:', error);
      message.reply('Komut rolü ayarlanırken bir hata oluştu!');
    }
  }
};