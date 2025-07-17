const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { hasCommandPermission, logCommand } = require('../database/modDatabase');
const { addLog, getLogChannel, LOG_TYPES } = require('../database/logDatabase');

module.exports = {
  name: 'mute',
  description: 'Belirtilen kullanıcıyı belirli bir süre için susturur',
  usage: 'mute <@kullanıcı/ID> <süre> [sebep]',
  async execute(message, args, client) {
    try {

      const memberRoles = message.member.roles.cache.map(role => role.id);
      const hasPermission = await hasCommandPermission(message.guild.id, message.author.id, 'timeout', memberRoles);
      
      if (!hasPermission) {
        return message.reply('Bu komutu kullanmak için gerekli yetkiye sahip değilsiniz!');
      }


       if (!args[0]) {
        return message.reply('Lütfen susturulacak bir kullanıcı belirtin!');
      }
      
      if (!args[1]) {
        return message.reply('Lütfen bir süre belirtin! (1s, 1m, 1h, 1d)');
      }
      

      let userId = args[0].replace(/[<@!>]/g, '');
      let member;

      try {
        member = await message.guild.members.fetch(userId);
      } catch (error) {
        return message.reply('Geçerli bir kullanıcı belirtmelisiniz!');
      }


      if (member.id === message.author.id) {
        return message.reply('Kendinizi susturamazsınız!');
      }
      

      if (member.id === client.user.id) {
        return message.reply('Beni susturamazsınız!');
      }
      

      if (member.id === message.guild.ownerId) {
        return message.reply('Sunucu sahibini susturamazsınız!');
      }
      

      if (member.roles.highest.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerId) {
        return message.reply('Bu kullanıcıyı susturamazsınız çünkü sizinle aynı veya daha yüksek bir role sahip!');
      }
      

      const timeArg = args[1].toLowerCase();
      let duration;
      
      if (timeArg.endsWith('s')) {
        duration = parseInt(timeArg) * 1000; // saniye
      } else if (timeArg.endsWith('m')) {
        duration = parseInt(timeArg) * 60 * 1000;  //dakika
      } else if (timeArg.endsWith('h')) {
        duration = parseInt(timeArg) * 60 * 60 * 1000; // Saat
      } else if (timeArg.endsWith('d')) {
        duration = parseInt(timeArg) * 24 * 60 * 60 * 1000; // gün 
      } else {
        return message.reply('Geçersiz süre formatı! Örnek: \`1s -> 1 saniye \n 1m -> 1 dakika \n 1h -> 1 saat \n 1d -> 1 gün\` \n **Timeout süresi maksimum 28 gün olabilir!**');
      }
      

      if (duration > 28 * 24 * 60 * 60 * 1000) {
        return message.reply('Timeout süresi maksimum 28 gün olabilir!');
      }
      

      const reason = args.slice(2).join(' ') || 'Sebep belirtilmedi';
      

      await member.timeout(duration, `${message.author.tag} tarafından: ${reason}`);
      

      await logCommand(message.guild.id, message.author.id, 'timeout', { userId: member.id, duration, reason });
      

      await addLog(
        message.guild.id,
        LOG_TYPES.TIMEOUT,
        message.author.id,
        member.id,
        'Kullanıcı Susturuldu',
        { 
          username: member.user.tag,
          duration: duration,
          reason: reason
        }
      );



        let timeString;
        if (duration < 60 * 1000) {
          timeString = `${Math.floor(duration / 1000)} saniye`;
        } else if (duration < 60 * 60 * 1000) {
          timeString = `${Math.floor(duration / (60 * 1000))} dakika`;
        } else if (duration < 24 * 60 * 60 * 1000) {
          timeString = `${Math.floor(duration / (60 * 60 * 1000))} saat`;
        } else {
          timeString = `${Math.floor(duration / (24 * 60 * 60 * 1000))} gün`;
        }

      

      const logChannelId = await getLogChannel(message.guild.id, LOG_TYPES.TIMEOUT);
      if (logChannelId) {
        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#FF9900')
            .setTitle('Kullanıcı Susturuldu')
            .setDescription(`**${member.user.tag}** kullanıcısı susturuldu.`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
              { name: 'Kullanıcı ID', value: member.id, inline: true },
              { name: 'Yetkili', value: `${message.author.tag} (${message.author.id})`, inline: true },
              { name: 'Süre', value: timeString, inline: true },
              { name: 'Sebep', value: reason, inline: false }
            )
            .setTimestamp();
          
          await logChannel.send({ embeds: [logEmbed] });
        }
      } 
      

      const embed = new EmbedBuilder()
        .setColor('#FF9900')
        .setTitle('Kullanıcı Susturuldu')
        .setDescription(`**${member.user.tag}** ${timeString} süreyle susturuldu.`)
        .addFields(
          { name: 'Susturan', value: `${message.author.tag}`, inline: true },
          { name: 'Süre', value: timeString, inline: true },
          { name: 'Sebep', value: reason, inline: true }
        )
        .setTimestamp();
      
      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Timeout komutu çalıştırılırken hata oluştu:', error);
      message.reply('Komut çalıştırılırken bir hata oluştu!');
    }
  },
};