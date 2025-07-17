const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { hasCommandPermission, logCommand } = require('../database/modDatabase');
const { addLog, getLogChannel, LOG_TYPES } = require('../database/logDatabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Belirtilen kullanıcıyı sunucudan yasaklar')
    .addUserOption(option =>
      option.setName('kullanıcı')
        .setDescription('Yasaklanacak kullanıcı')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('sebep')
        .setDescription('Yasaklama sebebi')
        .setRequired(false)),
  
  async execute(interaction, client) {
    try {

      const memberRoles = interaction.member.roles.cache.map(role => role.id);
      const hasPermission = await hasCommandPermission(interaction.guild.id, interaction.user.id, 'ban', memberRoles);
      
      if (!hasPermission) {
        return interaction.reply({ content: 'Bu komutu kullanmak için gerekli yetkiye sahip değilsiniz!', flags: 64 });
      }
      

      const user = interaction.options.getUser('kullanıcı');
      const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';
      

      if (user.id === interaction.user.id) {
        return interaction.reply({ content: 'Kendinizi yasaklayamazsınız!', flags: 64 });
      }
      

      if (user.id === client.user.id) {
        return interaction.reply({ content: 'Beni yasaklayamazsınız!', flags: 64 });
      }
      

     if (user.id === interaction.guild.ownerId) {
      return interaction.reply({ content: 'Sunucu sahibini yasaklayamazsınız!', flags: 64 });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (member && member.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
      return interaction.reply({ content: 'Bu kullanıcıyı yasaklayamazsınız çünkü sizinle aynı veya daha yüksek bir role sahip!', flags: 64 });
    }
      

      await interaction.guild.members.ban(user.id, { reason: `${interaction.user.tag} tarafından: ${reason}` });
      

      await logCommand(interaction.guild.id, interaction.user.id, 'ban', { userId: user.id, reason });
      

      await addLog(
        interaction.guild.id,
        LOG_TYPES.BAN,
        interaction.user.id,
        user.id,
        'Kullanıcı Yasaklandı',
        { 
          username: user.tag,
          reason: reason
        }
      );
      

      const logChannelId = await getLogChannel(interaction.guild.id, LOG_TYPES.BAN);
      if (logChannelId) {
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Kullanıcı Yasaklandı')
            .setDescription(`**${user.tag}** sunucudan yasaklandı.`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
              { name: 'Kullanıcı ID', value: user.id, inline: true },
              { name: 'Yetkili', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
              { name: 'Sebep', value: reason, inline: false }
            )
            .setTimestamp();
          
          await logChannel.send({ embeds: [logEmbed] });
        }
      }
      

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Kullanıcı Yasaklandı')
        .setDescription(`**${user.tag}** sunucudan yasaklandı.`)
        .addFields(
          { name: 'Yasaklayan', value: `${interaction.user.tag}`, inline: true },
          { name: 'Sebep', value: reason, inline: true }
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Ban komutu çalıştırılırken hata oluştu:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'Komut çalıştırılırken bir hata oluştu!', flags: 64 });
      } else {
        await interaction.reply({ content: 'Komut çalıştırılırken bir hata oluştu!', flags: 64 });
      }
    }
  },
};