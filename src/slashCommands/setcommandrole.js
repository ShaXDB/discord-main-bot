const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { addCommandPermission, removeCommandPermission, getCommandPermissions } = require('../database/modDatabase');
const { logCommand } = require('../database/modDatabase');
const { addLog, getLogChannel, LOG_TYPES } = require('../database/logDatabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setcommandrole')
    .setDescription('Belirli komutlar için yetkilendirilmiş rolleri ayarlar')
    .addStringOption(option =>
      option.setName('komut')
        .setDescription('Rol yetkisi ayarlanacak komut adı')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('rol')
        .setDescription('Komut için yetkilendirilecek rol')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('kaldır')
        .setDescription('Rolü kaldırmak için true olarak ayarlayın')
        .setRequired(false)),
  
  async execute(interaction, client) {
    try {

      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız!', flags: 64 });
      }
      

      const commandName = interaction.options.getString('komut');
      const role = interaction.options.getRole('rol');
      const remove = interaction.options.getBoolean('kaldır') || false;
      

      const validCommands = ['ban', 'unban', 'timeout', 'untimeout', 'setlogchannel', 'setcommandrole', 'warn'];
      if (!validCommands.includes(commandName)) {
        return interaction.reply({ 
          content: `Geçersiz komut adı! Geçerli komutlar: ${validCommands.join(', ')}`, 
          flags: 64 
        });
      }
      
      if (remove) {
        const removed = await removeCommandPermission(interaction.guild.id, commandName, role.id);
        
        if (!removed) {
          return interaction.reply({ 
            content: `**${role.name}** rolü zaten **${commandName}** komutu için yetkilendirilmemiş!`, 
            flags: 64 
          });
        }
        

        await addLog(
          interaction.guild.id,
          LOG_TYPES.SERVER_UPDATE,
          interaction.user.id,
          role.id,
          'Komut Rolü Kaldırıldı',
          { 
            command_name: commandName,
            role_name: role.name,
            role_id: role.id
          }
        );
        

        const logChannelId = await getLogChannel(interaction.guild.id, LOG_TYPES.SERVER_UPDATE);
        if (logChannelId) {
          const logChannel = interaction.guild.channels.cache.get(logChannelId);
          if (logChannel) {
            const logEmbed = new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('Komut Rolü Kaldırıldı')
              .setDescription(`**${commandName}** komutu için **${role.name}** rolünün yetkisi kaldırıldı.`)
              .addFields(
                { name: 'Komut', value: commandName, inline: true },
                { name: 'Rol', value: `${role.name} (${role.id})`, inline: true },
                { name: 'Yetkili', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true }
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
        
        await interaction.reply({ embeds: [embed] });
        

        await logCommand(interaction.guild.id, interaction.user.id, 'setcommandrole', { 
          commandName, 
          roleId: role.id, 
          action: 'remove' 
        });
        return;
      }
      

      const added = await addCommandPermission(interaction.guild.id, commandName, role.id);
      
      if (!added) {
        return interaction.reply({ 
          content: `**${role.name}** rolü zaten **${commandName}** komutu için yetkilendirilmiş!`, 
          flags: 64 
        });
      }
      

      await addLog(
        interaction.guild.id,
        LOG_TYPES.SERVER_UPDATE,
        interaction.user.id,
        role.id,
        'Komut Rolü Eklendi',
        { 
          command_name: commandName,
          role_name: role.name,
          role_id: role.id
        }
      );
      

      const logChannelId = await getLogChannel(interaction.guild.id, LOG_TYPES.SERVER_UPDATE);
      if (logChannelId) {
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Komut Rolü Eklendi')
            .setDescription(`**${commandName}** komutu için **${role.name}** rolü başarıyla yetkilendirildi.`)
            .addFields(
              { name: 'Komut', value: commandName, inline: true },
              { name: 'Rol', value: `${role.name} (${role.id})`, inline: true },
              { name: 'Yetkili', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true }
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
      
      await interaction.reply({ embeds: [embed] });
      

      await logCommand(interaction.guild.id, interaction.user.id, 'setcommandrole', { 
        commandName, 
        roleId: role.id, 
        action: 'add' 
      });
    } catch (error) {
      console.error('Komut rolü ayarlama hatası:', error);
      interaction.reply({ content: 'Komut rolü ayarlanırken bir hata oluştu!', flags: 64 });
    }
  }
};