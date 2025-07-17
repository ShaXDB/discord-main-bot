const { EmbedBuilder } = require('discord.js');
const { addWarn, getWarns, clearWarns } = require('../database/warnsDatabase');
const { hasCommandPermission, logCommand } = require('../database/modDatabase');
const { addLog, getLogChannel, LOG_TYPES } = require('../database/logDatabase');
require('dotenv').config();

module.exports = {
  name: 'uyarı',
  description: 'Kullanıcıları uyarma, uyarıları görüntüleme ve silme sistemi',
  usage: 'uyarı ekle/göster/sil <@kullanıcı/ID> [sebep/uyarı ID]',
  
  async execute(message, args, client) {
    try {

      const memberRoles = message.member.roles.cache.map(role => role.id);
      const hasPermission = await hasCommandPermission(message.guild.id, message.author.id, 'warn', memberRoles);
      
      if (!hasPermission) {
        return message.reply('Bu komutu kullanmak için gerekli yetkiye sahip değilsiniz!');
      }
      

      if (!args[0]) {
        return message.reply(`Doğru kullanım: \`${this.usage}\``);
      }

      const subCommand = args[0].toLowerCase();
      

      if (subCommand === 'ekle') {
        if (!args[1]) {
          return message.reply('Lütfen uyarılacak bir kullanıcı belirtin!');
        }
        

        let userId = args[1].replace(/[<@!>]/g, '');
        let user;
        
        

        try {
          user = await client.users.fetch(userId);
        } catch (error) {
          return message.reply('Geçerli bir kullanıcı belirtmelisiniz!');
        }
        

        if (user.id === message.author.id) {
          return message.reply('Kendinizi uyaramazsınız!');
        }
        

        if (user.id === client.user.id) {
          return message.reply('Beni uyaramazsınız!');
        }
        

        if (user.id === message.guild.ownerId) {
          return message.reply('Sunucu sahibini uyaramazsınız!');
        }
        

        const member = await message.guild.members.fetch(user.id).catch(() => null);
        if (member && member.roles.highest.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerId) {
          return message.reply('Bu kullanıcıyı uyaramazsınız çünkü sizinle aynı veya daha yüksek bir role sahip!');
        }
        

        const reason = args.slice(2).join(' ') || 'Sebep belirtilmedi';
        

        const warns = await getWarns(message.guild.id, user.id);
        

        if (warns.length >= 5) {

          const member = await message.guild.members.fetch(user.id).catch(() => null);
          
          if (member) {
            await member.ban({ reason: `${message.author.tag} tarafından: 5 uyarı limitine ulaşıldı` });
            
  
            await clearWarns(message.guild.id, user.id);
            
  
            const logChannelId = await getLogChannel(message.guild.id, LOG_TYPES.BAN);
            if (logChannelId) {
              const logChannel = message.guild.channels.cache.get(process.env.WARN_LOG_CHANNEL_ID);
              if (logChannel) {
                const banEmbed = new EmbedBuilder()
                  .setColor('#FF0000')
                  .setTitle('Kullanıcı Otomatik Yasaklandı')
                  .setDescription(`**${user.tag}** kullanıcısı 5 uyarı limitine ulaştığı için yasaklandı ve tüm uyarıları temizlendi.`)
                  .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                  .addFields(
                    { name: 'Kullanıcı ID', value: user.id, inline: true },
                    { name: 'Yetkili', value: `${message.author.tag} (${message.author.id})`, inline: true },
                    { name: 'Sebep', value: '5 uyarı limitine ulaşıldı', inline: false }
                  )
                  .setTimestamp();
                
                await logChannel.send({ embeds: [banEmbed] });
              }
            }
          }
          
          return message.reply(`**${user.tag}** kullanıcısı maksimum uyarı limitine (5) ulaştı, yasaklandı ve tüm uyarıları temizlendi!`);
        }
        

        const warnId = await addWarn(message.guild.id, user.id, message.author.id, reason);
        

        await logCommand(message.guild.id, message.author.id, 'warn', { userId: user.id, reason });
        

        const logChannelId = process.env.WARN_LOG_CHANNEL_ID;
        const logChannel = message.guild.channels.cache.get(logChannelId);
        
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#FFCC00')
            .setTitle('Kullanıcı Uyarıldı')
            .setDescription(`**${user.tag}** kullanıcısı uyarıldı.`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
              { name: 'Kullanıcı ID', value: user.id, inline: true },
              { name: 'Yetkili', value: `${message.author.tag} (${message.author.id})`, inline: true },
              { name: 'Uyarı ID', value: `${warnId}`, inline: true },
              { name: 'Sebep', value: reason, inline: false },
              { name: 'Toplam Uyarı', value: `${warns.length + 1}/5`, inline: true }
            )
            .setTimestamp();
          
          await logChannel.send({ embeds: [logEmbed] });
        }
        

        const embed = new EmbedBuilder()
          .setColor('#FFCC00')
          .setTitle('Kullanıcı Uyarıldı')
          .setDescription(`**${user.tag}** kullanıcısı başarıyla uyarıldı.`)
          .addFields(
            { name: 'Uyaran', value: `${message.author.tag}`, inline: true },
            { name: 'Sebep', value: reason, inline: true },
            { name: 'Uyarı ID', value: `${warnId}`, inline: true },
            { name: 'Toplam Uyarı', value: `${warns.length + 1}/5`, inline: true }
          )
          .setTimestamp();
        
        await message.reply({ embeds: [embed] });
      }
      

      else if (subCommand === 'göster') {
        if (!args[1]) {
          return message.reply('Lütfen uyarıları görüntülenecek bir kullanıcı belirtin!');
        }
        

        let userId = args[1].replace(/[<@!>]/g, '');
        let user;
        
        try {
          user = await client.users.fetch(userId);
        } catch (error) {
          return message.reply('Geçerli bir kullanıcı belirtmelisiniz!');
        }
        

        const warns = await getWarns(message.guild.id, user.id);
        
        if (warns.length === 0) {
          return message.reply(`**${user.tag}** kullanıcısının hiç uyarısı bulunmuyor.`);
        }
        

        const embed = new EmbedBuilder()
          .setColor('#FFCC00')
          .setTitle(`${user.tag} Kullanıcısının Uyarıları`)
          .setDescription(`Toplam ${warns.length}/5 uyarı`)
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .setTimestamp();
        
        warns.forEach((warn, index) => {
          const moderator = message.guild.members.cache.get(warn.moderator_id)?.user?.tag || warn.moderator_id;
          const date = new Date(warn.timestamp).toLocaleString('tr-TR');
          
          embed.addFields({
            name: `Uyarı #${index + 1} (ID: ${warn.id})`,
            value: `**Yetkili:** ${moderator}\n**Tarih:** ${date}\n**Sebep:** ${warn.reason || 'Sebep belirtilmedi'}`,
            inline: false
          });
        });
        
        await message.reply({ embeds: [embed] });
      }
      

      else if (subCommand === 'sil') {
        if (!args[1]) {
          return message.reply('Lütfen silinecek uyarının ID\'sini belirtin!');
        }
        
        const warnId = parseInt(args[1]);
        
        if (isNaN(warnId)) {
          return message.reply('Geçerli bir uyarı ID\'si belirtmelisiniz!');
        }
        

        const warn = await getWarnById(warnId);
        
        if (!warn || warn.guild_id !== message.guild.id) {
          return message.reply('Belirtilen ID\'ye sahip bir uyarı bulunamadı!');
        }
        

        const deleted = await deleteWarn(warnId);
        
        if (!deleted) {
          return message.reply('Uyarı silinirken bir hata oluştu!');
        }
        

        const user = await client.users.fetch(warn.user_id).catch(() => null);
        const userTag = user ? user.tag : warn.user_id;
        

        await logCommand(message.guild.id, message.author.id, 'warn', { action: 'delete', warnId });
        

        const logChannelId = process.env.WARN_LOG_CHANNEL_ID;
        const logChannel = message.guild.channels.cache.get(logChannelId);
        
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Uyarı Silindi')
            .setDescription(`**${userTag}** kullanıcısının bir uyarısı silindi.`)
            .addFields(
              { name: 'Kullanıcı ID', value: warn.user_id, inline: true },
              { name: 'Yetkili', value: `${message.author.tag} (${message.author.id})`, inline: true },
              { name: 'Uyarı ID', value: `${warnId}`, inline: true }
            )
            .setTimestamp();
          
          await logChannel.send({ embeds: [logEmbed] });
        }
        

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('Uyarı Silindi')
          .setDescription(`**${userTag}** kullanıcısının **${warnId}** ID'li uyarısı başarıyla silindi.`)
          .setTimestamp();
        
        await message.reply({ embeds: [embed] });
      }
      
      else {
        return message.reply(`Geçersiz alt komut! Kullanım: \`${this.usage}\``);
      }
      
    } catch (error) {
      console.error('Uyarı komutu çalıştırılırken hata oluştu:', error);
      message.reply('Komut çalıştırılırken bir hata oluştu!');
    }
  },
};