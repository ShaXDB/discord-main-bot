const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { hasCommandPermission, logCommand } = require('../database/modDatabase');
const { addLog, getLogChannel, LOG_TYPES } = require('../database/logDatabase');

module.exports = {
  name: 'unmute',
  description: 'Belirtilen kullanıcının susturmasını kaldırır',
  usage: 'unmute <@kullanıcı/ID>',
  async execute(message, args, client) {
    try {

      const memberRoles = message.member.roles.cache.map(role => role.id);
      const hasPermission = await hasCommandPermission(message.guild.id, message.author.id, 'untimeout', memberRoles);
      
      if (!hasPermission) {
        return message.reply('Bu komutu kullanmak için gerekli yetkiye sahip değilsiniz!');
      }
      

      if (!args[0]) {
        return message.reply('Lütfen susturması kaldırılacak bir kullanıcı belirtin!');
      }
      

      let userId = args[0].replace(/[<@!>]/g, '');
      let member;
      
      try {
        member = await message.guild.members.fetch(userId);
      } catch (error) {
        return message.reply('Geçerli bir kullanıcı belirtmelisiniz!');
      }
      

      if (!member.communicationDisabledUntilTimestamp) {
        return message.reply('Bu kullanıcı zaten susturulmuş değil!');
      }
      

      await member.timeout(null, `${message.author.tag} tarafından kaldırıldı`);
      

      await logCommand(message.guild.id, message.author.id, 'untimeout', { userId: member.id });
      

      await addLog(
        message.guild.id,
        LOG_TYPES.UNTIMEOUT,
        message.author.id,
        member.id,
        'Kullanıcı Susturması Kaldırıldı',
        { 
          username: member.user.tag
        }
      );
      

      const logChannelId = await getLogChannel(message.guild.id, LOG_TYPES.UNTIMEOUT);
      if (logChannelId) {
        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Kullanıcı Susturması Kaldırıldı')
            .setDescription(`**${member.user.tag}** kullanıcısının susturması kaldırıldı.`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
              { name: 'Kullanıcı ID', value: member.id, inline: true },
              { name: 'Yetkili', value: `${message.author.tag} (${message.author.id})`, inline: true }
            )
            .setTimestamp();
          
          await logChannel.send({ embeds: [logEmbed] });
        }
      }
      

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Kullanıcı Susturması Kaldırıldı')
        .setDescription(`**${member.user.tag}** kullanıcısının susturması kaldırıldı.`)
        .addFields(
          { name: 'Susturmayı Kaldıran', value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();
      
      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Untimeout komutu çalıştırılırken hata oluştu:', error);
      message.reply('Komut çalıştırılırken bir hata oluştu!');
    }
  },
};