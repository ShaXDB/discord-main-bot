const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { addWarn, getWarns, deleteWarn, getWarnById, clearWarns } = require('../database/warnsDatabase');
const { hasCommandPermission, logCommand } = require('../database/modDatabase');
const { addLog, getLogChannel, LOG_TYPES } = require('../database/logDatabase');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uyarı')
    .setDescription('Kullanıcıları uyarma, uyarıları görüntüleme ve silme sistemi')
    .addSubcommand(subcommand =>
      subcommand
        .setName('ekle')
        .setDescription('Kullanıcıya uyarı ekler')
        .addUserOption(option =>
          option.setName('kullanıcı')
            .setDescription('Uyarılacak kullanıcı')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('sebep')
            .setDescription('Uyarı sebebi')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('göster')
        .setDescription('Kullanıcının uyarılarını gösterir')
        .addUserOption(option =>
          option.setName('kullanıcı')
            .setDescription('Uyarıları görüntülenecek kullanıcı')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('sil')
        .setDescription('Belirtilen ID\'ye sahip uyarıyı siler')
        .addIntegerOption(option =>
          option.setName('uyarı_id')
            .setDescription('Silinecek uyarının ID\'si')
            .setRequired(true))),
  
  async execute(interaction, client) {
    try {
      const memberRoles = interaction.member.roles.cache.map(role => role.id);
      const hasPermission = await hasCommandPermission(interaction.guild.id, interaction.user.id, 'warn', memberRoles);
      
      if (!hasPermission) {
        return interaction.reply({ content: 'Bu komutu kullanmak için gerekli yetkiye sahip değilsiniz!', flags: 64 });
      }
      
      const subCommand = interaction.options.getSubcommand();
      
      if (subCommand === 'ekle') {
        const user = interaction.options.getUser('kullanıcı');
        const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';
        
        
        if (user.id === interaction.user.id) {
          return interaction.reply({ content: 'Kendinizi uyaramazsınız!', flags: 64 });
        }
    
        if (user.id === client.user.id) {
          return interaction.reply({ content: 'Beni uyaramazsınız!', flags: 64 });
        }
        
      
      if (user.id === interaction.guild.ownerId) {
        return interaction.reply({ content: 'Sunucu sahibini uyaramazsınız!', flags: 64 });
      }
      
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (member && member.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
        return interaction.reply({ content: 'Bu kullanıcıyı uyaramazsınız çünkü sizinle aynı veya daha yüksek bir role sahip!', flags: 64 });
      }
      
        
        const warns = await getWarns(interaction.guild.id, user.id);
        
        if (warns.length >= 5) {
           const member = await interaction.guild.members.fetch(user.id).catch(() => null);
          
          if (member) {
            await member.ban({ reason: `${interaction.user.tag} tarafından: 5 uyarı limitine ulaşıldı` });
            
            await clearWarns(interaction.guild.id, user.id);
            
            const logChannelId = await getLogChannel(interaction.guild.id, LOG_TYPES.BAN);
            if (logChannelId) {
              const logChannel = interaction.guild.channels.cache.get(process.env.WARN_LOG_CHANNEL_ID);
              if (logChannel) {
                const banEmbed = new EmbedBuilder()
                  .setColor('#FF0000')
                  .setTitle('Kullanıcı Otomatik Yasaklandı')
                  .setDescription(`**${user.tag}** kullanıcısı 5 uyarı limitine ulaştığı için yasaklandı ve tüm uyarıları temizlendi.`)
                  .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                  .addFields(
                    { name: 'Kullanıcı ID', value: user.id, inline: true },
                    { name: 'Yetkili', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                    { name: 'Sebep', value: '5 uyarı limitine ulaşıldı', inline: false }
                  )
                  .setTimestamp();
                
                await logChannel.send({ embeds: [banEmbed] });
              }
            }
          }
          
          return interaction.reply({ content: `**${user.tag}** kullanıcısı maksimum uyarı limitine (5) ulaştı, yasaklandı ve tüm uyarıları temizlendi!`, flags: 64 });
        }
        
        const warnId = await addWarn(interaction.guild.id, user.id, interaction.user.id, reason);
        
        await logCommand(interaction.guild.id, interaction.user.id, 'warn', { userId: user.id, reason });
        
        const logChannelId = process.env.WARN_LOG_CHANNEL_ID;
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#FFCC00')
            .setTitle('Kullanıcı Uyarıldı')
            .setDescription(`**${user.tag}** kullanıcısı uyarıldı.`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
              { name: 'Kullanıcı ID', value: user.id, inline: true },
              { name: 'Yetkili', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
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
            { name: 'Uyaran', value: `${interaction.user.tag}`, inline: true },
            { name: 'Sebep', value: reason, inline: true },
            { name: 'Uyarı ID', value: `${warnId}`, inline: true },
            { name: 'Toplam Uyarı', value: `${warns.length + 1}/5`, inline: true }
          )
          .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
      }
      
      else if (subCommand === 'göster') {
        const user = interaction.options.getUser('kullanıcı');
        
        const warns = await getWarns(interaction.guild.id, user.id);
        
        if (warns.length === 0) {
          return interaction.reply({ content: `**${user.tag}** kullanıcısının hiç uyarısı bulunmuyor.`, flags: 64 });
        }
        
        const embed = new EmbedBuilder()
          .setColor('#FFCC00')
          .setTitle(`${user.tag} Kullanıcısının Uyarıları`)
          .setDescription(`Toplam ${warns.length}/5 uyarı`)
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .setTimestamp();
        
        warns.forEach((warn, index) => {
          const moderator = interaction.guild.members.cache.get(warn.moderator_id)?.user?.tag || warn.moderator_id;
          const date = new Date(warn.timestamp).toLocaleString('tr-TR');
          
          embed.addFields({
            name: `Uyarı #${index + 1} (ID: ${warn.id})`,
            value: `**Yetkili:** ${moderator}\n**Tarih:** ${date}\n**Sebep:** ${warn.reason || 'Sebep belirtilmedi'}`,
            inline: false
          });
        });
        
        await interaction.reply({ embeds: [embed] });
      }
      
      else if (subCommand === 'sil') {
        const warnId = interaction.options.getInteger('uyarı_id');
        
        const warn = await getWarnById(warnId);
        
        if (!warn || warn.guild_id !== interaction.guild.id) {
          return interaction.reply({ content: 'Belirtilen ID\'ye sahip bir uyarı bulunamadı!', flags: 64 });
        }
        
        const deleted = await deleteWarn(warnId);
        
        if (!deleted) {
          return interaction.reply({ content: 'Uyarı silinirken bir hata oluştu!', flags: 64 });
        }
        
        const user = await client.users.fetch(warn.user_id).catch(() => null);
        const userTag = user ? user.tag : warn.user_id;
        
        await logCommand(interaction.guild.id, interaction.user.id, 'warn', { action: 'delete', warnId });
        
        const logChannelId = process.env.WARN_LOG_CHANNEL_ID;
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Uyarı Silindi')
            .setDescription(`**${userTag}** kullanıcısının bir uyarısı silindi.`)
            .addFields(
              { name: 'Kullanıcı ID', value: warn.user_id, inline: true },
              { name: 'Yetkili', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
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
        
        await interaction.reply({ embeds: [embed] });
      }
      
    } catch (error) {
      console.error('Uyarı komutu çalıştırılırken hata oluştu:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'Komut çalıştırılırken bir hata oluştu!', flags: 64 });
      } else {
        await interaction.reply({ content: 'Komut çalıştırılırken bir hata oluştu!', flags: 64 });
      }
    }
  },
};