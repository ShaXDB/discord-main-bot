const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { setLogChannel, removeLogChannel, LOG_TYPES, addLog, getLogChannel } = require('../database/logDatabase');
const { hasCommandPermission, logCommand } = require('../database/modDatabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlogchannel')
    .setDescription('Belirli log türleri için log kanalı ayarlar')
    .addStringOption(option =>
      option.setName('log_türü')
        .setDescription('Ayarlanacak log türü')
        .setRequired(true)
        .addChoices(
          ...Object.entries(LOG_TYPES).map(([key, value]) => ({
            name: value,
            value: value
          }))
        ))
    .addChannelOption(option =>
      option.setName('kanal')
        .setDescription('Log kanalı olarak ayarlanacak kanal')
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('kaldır')
        .setDescription('Log kanalını kaldırmak için true olarak ayarlayın')
        .setRequired(false)),
  
  async execute(interaction, client) {
    try {

      const memberRoles = interaction.member.roles.cache.map(role => role.id);
      const hasPermission = await hasCommandPermission(interaction.guild.id, interaction.user.id, 'setlogchannel', memberRoles);
      
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && !hasPermission) {
        return interaction.reply({ content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız!', flags: 64 });
      }
      

      const logType = interaction.options.getString('log_türü');
      const channel = interaction.options.getChannel('kanal');
      const remove = interaction.options.getBoolean('kaldır');
      

      if (remove) {
        await removeLogChannel(interaction.guild.id, logType);
        

        await addLog(
          interaction.guild.id,
          LOG_TYPES.SERVER_UPDATE,
          interaction.user.id,
          interaction.guild.id,
          'Log Kanalı Kaldırıldı',
          { 
            log_type: logType
          }
        );
        

        const logChannelId = await getLogChannel(interaction.guild.id, LOG_TYPES.SERVER_UPDATE);
        if (logChannelId) {
          const logChannel = interaction.guild.channels.cache.get(logChannelId);
          if (logChannel) {
            const logEmbed = new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('Log Kanalı Kaldırıldı')
              .setDescription(`**${logType}** log türü için kanal kaldırıldı.`)
              .addFields(
                { name: 'Log Türü', value: logType, inline: true },
                { name: 'Yetkili', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true }
              )
              .setTimestamp();
            
            await logChannel.send({ embeds: [logEmbed] });
          }
        }
        
        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('Log Kanalı Kaldırıldı')
          .setDescription(`**${logType}** log türü için kanal başarıyla kaldırıldı.`)
          .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
        

        await logCommand(interaction.guild.id, interaction.user.id, 'setlogchannel', { logType, action: 'remove' });
        return;
      }
      

      if (!channel) {
        return interaction.reply({ content: 'Lütfen bir kanal belirtin veya kanalı kaldırmak için "kaldır" seçeneğini true yapın!', flags: 64 });
      }
      

      await setLogChannel(interaction.guild.id, logType, channel.id);
      

      await addLog(
        interaction.guild.id,
        LOG_TYPES.SERVER_UPDATE,
        interaction.user.id,
        channel.id,
        'Log Kanalı Ayarlandı',
        { 
          log_type: logType,
          channel_name: channel.name,
          channel_id: channel.id
        }
      );
      

      const logChannelId = await getLogChannel(interaction.guild.id, LOG_TYPES.SERVER_UPDATE);
      if (logChannelId) {
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Log Kanalı Ayarlandı')
            .setDescription(`**${logType}** log türü için <#${channel.id}> kanalı ayarlandı.`)
            .addFields(
              { name: 'Log Türü', value: logType, inline: true },
              { name: 'Kanal', value: `${channel.name} (${channel.id})`, inline: true },
              { name: 'Yetkili', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true }
            )
            .setTimestamp();
          
          await logChannel.send({ embeds: [logEmbed] });
        }
      }
      
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Log Kanalı Ayarlandı')
        .setDescription(`**${logType}** log türü için <#${channel.id}> kanalı başarıyla ayarlandı.`)
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      

      await logCommand(interaction.guild.id, interaction.user.id, 'setlogchannel', { logType, channelId: channel.id });
    } catch (error) {
      console.error('Log kanalı ayarlama hatası:', error);
      interaction.reply({ content: 'Log kanalı ayarlanırken bir hata oluştu!', flags: 64 });
    }
  }
};