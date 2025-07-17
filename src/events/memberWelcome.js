const { Events, EmbedBuilder } = require('discord.js');
const { addLog, getLogChannel, LOG_TYPES } = require('../database/logDatabase');
require('dotenv').config();

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member, client) {
    try {
      
      const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
      const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
      
      if (welcomeChannel) {

        const welcomeMessage = `Sunucumuza Hoş Geldin! <@${member.id}>! Seninle Beraber ${member.guild.memberCount} Kişi Olduk! <@&${process.env.WELCOME_PING_ROLE_ID}>!`;
        

        const infoEmbed = new EmbedBuilder()
          .setColor('#d8d8d8')
          .setAuthor({ 
            name: member.user.username, 
            iconURL: member.user.displayAvatarURL({ dynamic: true })
          })
          .setTitle(`${process.env.SERVER_NAME}'ya Hoş Geldin!`)
          .setDescription('Suncumuzdaki ;')
          .addFields(
            { name: `<#${process.env.RULES_CHANNEL_ID}>`, value: 'Kanalından kuralları okuyabilir', inline: false },
            { name: `<#${process.env.ROLE_CHANNEL_ID}>`, value: 'Kanalından istediğin rolleri alabilir', inline: false },
            { name: `<#${process.env.ANNOUNCEMENT_CHANNEL_ID}>`, value: 'kanalından sunucumuzun duyurularından veya çekilişlerinden haberdar olabilirsin!', inline: false }
          )
          .setThumbnail(member.guild.iconURL({ dynamic: true })) 
          .setFooter({ 
            text: `Sunucumuzda keyifli bir vakit geçirmen dileğiyle!` 
          })
          .setImage(process.env.WELCOME_IMAGE_URL) 
          .setTimestamp();
        

        await welcomeChannel.send({ 
          content: welcomeMessage,
          embeds: [infoEmbed]
        });

        await welcomeChannel.send(`<@${member.id}> şuanda sunucumuzda aktif 2 tane Nitro çekilişi var. Katılmak istersen <#${process.env.ANNOUNCEMENT_CHANNEL_ID}> kanalından ayrıntılara bakabilirsin <:kalp:${process.env.KALP_EMOJI_ID}>`);
      }
    
      try {
        await member.roles.add(process.env.MEMBER_ROLE_ID);
      } catch (roleError) {
        console.error('Üye rolü eklenirken hata oluştu:', roleError);
      }
      
    } catch (error) {
      console.error('Üye karşılama işlemi sırasında hata oluştu:', error);
    }
  }
};

