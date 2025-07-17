const { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "git",
    description: "Belirttiğiniz kullanıcının yanına gitmenizi sağlar.",
    usage: "git <@kullanıcı/ID>",
    
    async execute(message, args, client) {

        if (!args[0]) {
            return message.reply('Lütfen yanına gitmek istediğiniz bir kullanıcı belirtin!');
        }
        

        let userId = args[0].replace(/[<@!>]/g, '');
        let mentionedUser;
        
        try {
            mentionedUser = await message.guild.members.fetch(userId);
        } catch (error) {
            return message.reply('Geçerli bir kullanıcı belirtmelisiniz!');
        }


        const voiceChannel = mentionedUser.voice.channel;
        if (!voiceChannel) {
            return message.reply('Etiketlediğiniz kullanıcı herhangi bir ses kanalında değil!');
        }


        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept')
                    .setLabel('Kabul Et')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('decline')
                    .setLabel('Reddet')
                    .setStyle(ButtonStyle.Danger),
            );


        const filter = (buttonInteraction) => buttonInteraction.user.id === mentionedUser.id;
        const messageReply = await message.reply({ 
            content: `${mentionedUser}, ${message.author} adlı kullanıcı bulunduğun sese gelmek istiyor.`, 
            components: [row] 
        });

        const collector = messageReply.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async buttonInteraction => {
            if (buttonInteraction.customId === 'accept') {
                const authorVoiceChannel = message.member.voice.channel;
                if (!authorVoiceChannel) {
                    return buttonInteraction.reply({ content: 'Ses kanalında değilsiniz!', flags: 64 });
                }
                try {
                    await message.member.voice.setChannel(voiceChannel);
                    buttonInteraction.reply({ content: `${message.author} başarıyla <#${voiceChannel.id}> kanalına taşındı.` });
                } catch (error) {
                    console.error(error);
                    buttonInteraction.reply({ content: 'Bir hata oluştu, kanala taşınamadınız!', flags: 64 });
                }
            } else if (buttonInteraction.customId === 'decline') {
                buttonInteraction.reply({ content: 'İstek reddedildi.', flags: 64 });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                messageReply.edit({ content: 'Zaman aşımına uğradı.', components: [] });
            }
        });
    }
};