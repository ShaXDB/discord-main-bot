const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { hasCommandPermission, logCommand } = require('../database/modDatabase');
const { addLog, getLogChannel, LOG_TYPES } = require('../database/logDatabase');

module.exports = {
  name: 'ban',
  description: 'Belirtilen kullanıcıyı sunucudan yasaklar',
  usage: 'ban <@kullanıcı/ID> [sebep]',
  async execute(message, args, client) {
    try {

      const memberRoles = message.member.roles.cache.map(role => role.id);
      const hasPermission = await hasCommandPermission(message.guild.id, message.author.id, 'ban', memberRoles);
      
      if (!hasPermission) {
        return message.reply('Bu komutu kullanmak için gerekli yetkiye sahip değilsiniz!');
      }
      

      if (!args[0]) {
        return message.reply('Lütfen yasaklanacak bir kullanıcı belirtin!');
      }
      

      let userId = args[0].replace(/[<@!>]/g, '');
      let reason = args.slice(1).join(' ') || 'Sebep belirtilmedi';
      

      const user = await client.users.fetch(userId).catch(() => null);
      if (!user) {
        return message.reply('Geçerli bir kullanıcı belirtmelisiniz!');
      }
      

      if (user.id === message.author.id) {
        return message.reply('Kendinizi yasaklayamazsınız!');
      }
      

      if (user.id === client.user.id) {
        return message.reply('Beni yasaklayamazsınız!');
      }
      

      if (user.id === message.guild.ownerId) {
        return message.reply('Sunucu sahibini yasaklayamazsınız!');
      }
      

    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (member && member.roles.highest.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerId) {
    return message.reply('Bu kullanıcıyı yasaklayamazsınız çünkü sizinle aynı veya daha yüksek bir role sahip!');
    }


      await message.guild.members.ban(user.id, { reason: `${message.author.tag} tarafından: ${reason}` });
      

      await logCommand(message.guild.id, message.author.id, 'ban', { userId, reason });
      

      await addLog(
        message.guild.id,
        LOG_TYPES.BAN,
        message.author.id,
        user.id,
        'Kullanıcı Yasaklandı',
        { 
          username: user.tag,
          reason: reason
        }
      );
      

      const logChannelId = await getLogChannel(message.guild.id, LOG_TYPES.BAN);
      if (logChannelId) {
        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Kullanıcı Yasaklandı')
            .setDescription(`**${user.tag}** sunucudan yasaklandı.`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
              { name: 'Kullanıcı ID', value: user.id, inline: true },
              { name: 'Yetkili', value: `${message.author.tag} (${message.author.id})`, inline: true },
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
          { name: 'Yasaklayan', value: `${message.author.tag}`, inline: true },
          { name: 'Sebep', value: reason, inline: true }
        )
        .setTimestamp();
      
      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Ban komutu çalıştırılırken hata oluştu:', error);
      message.reply('Komut çalıştırılırken bir hata oluştu!');
    }
  },
};