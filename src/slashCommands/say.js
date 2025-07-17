const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Sunucu istatistiklerini gösterir."),
    
    async execute(interaction, client) {


        const guild = interaction.guild;
        const totalMembers = guild.memberCount;
        const totalBoosts = guild.premiumSubscriptionCount;

        let voiceMembersCount = 0;
        let streamingCount = 0;
        let activityCount = 0;

        guild.channels.cache.forEach(channel => {
            if (channel.type === 2 || channel.type === 13) {
                channel.members.forEach(member => {
                    voiceMembersCount++;
                    if (member.voice.streaming) streamingCount++;
                    if (member.voice.channel.type === 13) activityCount++;

                    if (member.presence && member.presence.activities) {
                        member.presence.activities.forEach(activity => {
                            if (activity.type === 'PLAYING') {
                                activityCount++;
                            }
                        });
                    }
                });
            }
        });

        const embed = new EmbedBuilder()
            .setColor("#65b5af")
            .setAuthor({ name: `${process.env.SERVER_NAME} | Anlık Sunucu Durumu`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 4096 }))
            .addFields(
                { name: 'Toplam Üye Sayısı', value: `\`${totalMembers}\``},
                { name: 'Toplam Boost Sayısı', value: `\`${totalBoosts}\``},
                { name: 'Ses Kanallarındaki Toplam Üye Sayısı', value: `\`${voiceMembersCount}\``},
                { name: 'Yayın Açan Üye Sayısı', value: `\`${streamingCount}\``},
                { name: 'Oyun Oynayan Üye Sayısı', value: `\`${activityCount}\``}
            );

        await interaction.reply({ embeds: [embed], flags: 64 });

    }
};