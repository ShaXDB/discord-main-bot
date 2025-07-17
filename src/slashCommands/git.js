const { SlashCommandBuilder, EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("git")
        .setDescription("Belirttiğiniz kullanıcının yanına gitmenizi sağlar.")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("Yanına gitmek istediğiniz kişi.")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const mentionedUser = interaction.options.getMember('user');

        if (!mentionedUser) {
            return interaction.reply('Lütfen bir kullanıcı etiketleyin!');
        }


        const voiceChannel = mentionedUser.voice.channel;
        if (!voiceChannel) {
            return interaction.reply('Etiketlediğiniz kullanıcı herhangi bir ses kanalında değil!');
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
        const messageReply = await interaction.reply({ 
            content: `${mentionedUser}, ${interaction.user} adlı kullanıcı bulunduğun sese gelmek istiyor.`, 
            components: [row], 
            fetchReply: true 
        });

        const collector = messageReply.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async buttonInteraction => {
            if (buttonInteraction.customId === 'accept') {
                const authorVoiceChannel = interaction.member.voice.channel;
                if (!authorVoiceChannel) {
                    return buttonInteraction.reply({ content: 'Ses kanalında değilsiniz!', flags: 64 });
                }
                try {
                    await interaction.member.voice.setChannel(voiceChannel);
                    buttonInteraction.reply({ content: `${interaction.user} başarıyla <#${voiceChannel.id}> kanalına taşındı.` });
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