const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { hasCommandPermission, logCommand } = require('../database/modDatabase');
const { addLog, getLogChannel, LOG_TYPES } = require('../database/logDatabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Belirtilen kullanıcıyı belirli bir süre için susturur')
    .addUserOption(option =>
      option.setName('kullanıcı')
        .setDescription('Susturulacak kullanıcı')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('süre')
        .setDescription('Susturma süresi (örn: 1m, 1h, 1d)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('sebep')
        .setDescription('Susturma sebebi')
        .setRequired(false)),
  
  async execute(interaction, client) {
    try {
      const user = interaction.options.getUser('kullanıcı');
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      
      if (!member) {
        return interaction.reply({ content: 'Belirtilen kullanıcı sunucuda bulunamadı!', flags: 64 });
      }
    
      if (user.id === interaction.user.id) {
        return interaction.reply({ content: 'Kendinizi susturamazsınız!', flags: 64 });
      }
    
      if (user.id === client.user.id) {
        return interaction.reply({ content: 'Beni susturamazsınız!', flags: 64 });
      }
      
     
     if (user.id === interaction.guild.ownerId) {
        return interaction.reply({ content: 'Sunucu sahibini susturamazsınız!', flags: 64 });
     }
     
     if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
      return interaction.reply({ content: 'Bu kullanıcıyı susturamazsınız çünkü sizinle aynı veya daha yüksek bir role sahip!', flags: 64 });
    }
      
      const durationInput = interaction.options.getString('süre');
      const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';
      const durationRegex = /^(\d+)([smhd])$/;
      const match = durationInput.match(durationRegex);
      
      if (!match) {
        return interaction.reply({ content: 'Geçersiz süre formatı! Örnek: 10s (saniye), 10m (dakika), 10h (saat), 10d (gün)', flags: 64 });
      }
      
      const value = parseInt(match[1]);
      const unit = match[2];
      let durationMs = 0;
      
      switch (unit) {
        case 's': // saniye
          durationMs = value * 1000;
          break;
        case 'm': // dakika
          durationMs = value * 60 * 1000;
          break;
        case 'h': // saat
          durationMs = value * 60 * 60 * 1000;
          break;
        case 'd': // gün
          durationMs = value * 24 * 60 * 60 * 1000;
          break;
      }
      
      const maxTimeoutDuration = 28 * 24 * 60 * 60 * 1000;
      if (durationMs > maxTimeoutDuration) {
        return interaction.reply({ content: 'Timeout süresi maksimum 28 gün olabilir!', flags: 64 });
      }
      await member.timeout(durationMs, `${interaction.user.tag} tarafından: ${reason}`);
      
      await logCommand(interaction.guild.id, interaction.user.id, 'timeout', { userId: user.id, duration: durationInput, reason });
      let readableDuration = '';
      switch (unit) {
        case 's':
          readableDuration = `${value} saniye`;
          break;
        case 'm':
          readableDuration = `${value} dakika`;
          break;
        case 'h':
          readableDuration = `${value} saat`;
          break;
        case 'd':
          readableDuration = `${value} gün`;
          break;
      }
      
      await addLog(
        interaction.guild.id,
        LOG_TYPES.TIMEOUT,
        interaction.user.id,
        user.id,
        'Kullanıcı Susturuldu',
        { 
          username: user.tag,
          duration: durationInput,
          reason: reason
        }
      );
      const logChannelId = await getLogChannel(interaction.guild.id, LOG_TYPES.TIMEOUT);
      if (logChannelId) {
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('Kullanıcı Susturuldu')
            .setDescription(`**${user.tag}** kullanıcısı susturuldu.`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
              { name: 'Kullanıcı ID', value: user.id, inline: true },
              { name: 'Yetkili', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
              { name: 'Süre', value: readableDuration, inline: true },
              { name: 'Sebep', value: reason, inline: false }
            )
            .setTimestamp();
          
          await logChannel.send({ embeds: [logEmbed] });
        }
      }
      
      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('Kullanıcı Susturuldu')
        .setDescription(`**${user.tag}** kullanıcısı ${readableDuration} süreyle susturuldu.`)
        .addFields(
          { name: 'Susturan', value: `${interaction.user.tag}`, inline: true },
          { name: 'Süre', value: readableDuration, inline: true },
          { name: 'Sebep', value: reason, inline: true }
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Timeout komutu çalıştırılırken hata oluştu:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'Komut çalıştırılırken bir hata oluştu!', flags: 64 });
      } else {
        await interaction.reply({ content: 'Komut çalıştırılırken bir hata oluştu!', flags: 64 });
      }
    }
  },
};