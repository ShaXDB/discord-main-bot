const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { hasCommandPermission, logCommand } = require('../database/modDatabase');
const { addLog, getLogChannel, LOG_TYPES } = require('../database/logDatabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Belirtilen kullanıcının sunucudan yasağını kaldırır')
    .addStringOption(option =>
      option.setName('kullanıcı_id')
        .setDescription('Yasağı kaldırılacak kullanıcının ID\'si')
        .setRequired(true)),
  
  async execute(interaction, client) {
    try {
      const memberRoles = interaction.member.roles.cache.map(role => role.id);
      const hasPermission = await hasCommandPermission(interaction.guild.id, interaction.user.id, 'unban', memberRoles);
      
      if (!hasPermission) {
        return interaction.reply({ content: 'Bu komutu kullanmak için gerekli yetkiye sahip değilsiniz!', flags: 64 });
      }
      
      const userId = interaction.options.getString('kullanıcı_id');
    
      try {
        await interaction.guild.members.unban(userId);
        
        await logCommand(interaction.guild.id, interaction.user.id, 'unban', { userId });
        
        const user = await client.users.fetch(userId).catch(() => null);
        const userTag = user ? user.tag : userId;
        
        await addLog(
          interaction.guild.id,
          LOG_TYPES.UNBAN,
          interaction.user.id,
          userId,
          'Kullanıcı Yasağı Kaldırıldı',
          { 
            username: userTag
          }
        );
        
        const logChannelId = await getLogChannel(interaction.guild.id, LOG_TYPES.UNBAN);
        if (logChannelId) {
          const logChannel = interaction.guild.channels.cache.get(logChannelId);
          if (logChannel) {
            const logEmbed = new EmbedBuilder()
              .setColor('#00FF00')
              .setTitle('Kullanıcı Yasağı Kaldırıldı')
              .setDescription(`**${userTag}** kullanıcısının yasağı kaldırıldı.`)
              .addFields(
                { name: 'Kullanıcı ID', value: userId, inline: true },
                { name: 'Yetkili', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true }
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
            { name: 'Yasağı Kaldıran', value: `${interaction.user.tag}`, inline: true }
          )
          .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
        
      } catch (error) {
        if (error.code === 10026) { // Unknown Ban
          return interaction.reply({ content: 'Bu kullanıcı zaten yasaklı değil!', flags: 64 });
        }
        throw error;
      }
      
    } catch (error) {
      console.error('Unban komutu çalıştırılırken hata oluştu:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'Komut çalıştırılırken bir hata oluştu!', flags: 64 });
      } else {
        await interaction.reply({ content: 'Komut çalıştırılırken bir hata oluştu!', flags: 64 });
      }
    }
  },
};