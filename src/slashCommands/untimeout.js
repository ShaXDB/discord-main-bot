const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { hasCommandPermission, logCommand } = require('../database/modDatabase');
const { addLog, getLogChannel, LOG_TYPES } = require('../database/logDatabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Belirtilen kullanıcının susturmasını kaldırır')
    .addUserOption(option =>
      option.setName('kullanıcı')
        .setDescription('Susturması kaldırılacak kullanıcı')
        .setRequired(true)),
  
  async execute(interaction, client) {
    try {

      const memberRoles = interaction.member.roles.cache.map(role => role.id);
      const hasPermission = await hasCommandPermission(interaction.guild.id, interaction.user.id, 'untimeout', memberRoles);
      
      if (!hasPermission) {
        return interaction.reply({ content: 'Bu komutu kullanmak için gerekli yetkiye sahip değilsiniz!', flags: 64 });
      }
      

      const user = interaction.options.getUser('kullanıcı');
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      
      if (!member) {
        return interaction.reply({ content: 'Belirtilen kullanıcı sunucuda bulunamadı!', flags: 64 });
      }
      

      if (!member.communicationDisabledUntilTimestamp) {
        return interaction.reply({ content: 'Bu kullanıcı zaten susturulmuş değil!', flags: 64 });
      }
      

      await member.timeout(null, `${interaction.user.tag} tarafından kaldırıldı`);
      

      await logCommand(interaction.guild.id, interaction.user.id, 'untimeout', { userId: user.id });
      

      await addLog(
        interaction.guild.id,
        LOG_TYPES.UNTIMEOUT,
        interaction.user.id,
        user.id,
        'Kullanıcı Susturması Kaldırıldı',
        { 
          username: user.tag
        }
      );
      

      const logChannelId = await getLogChannel(interaction.guild.id, LOG_TYPES.UNTIMEOUT);
      if (logChannelId) {
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Kullanıcı Susturması Kaldırıldı')
            .setDescription(`**${user.tag}** kullanıcısının susturması kaldırıldı.`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
              { name: 'Kullanıcı ID', value: user.id, inline: true },
              { name: 'Yetkili', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true }
            )
            .setTimestamp();
          
          await logChannel.send({ embeds: [logEmbed] });
        }
      }
      

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Kullanıcı Susturması Kaldırıldı')
        .setDescription(`**${user.tag}** kullanıcısının susturması kaldırıldı.`)
        .addFields(
          { name: 'Susturmayı Kaldıran', value: `${interaction.user.tag}`, inline: true }
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Untimeout komutu çalıştırılırken hata oluştu:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'Komut çalıştırılırken bir hata oluştu!', flags: 64 });
      } else {
        await interaction.reply({ content: 'Komut çalıştırılırken bir hata oluştu!', flags: 64 });
      }
    }
  },
};