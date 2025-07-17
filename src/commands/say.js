const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "say",
    description: "Sunucu istatistiklerini gösterir.",
    
    async execute(message, args, client) {


        const guild = message.guild;
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
            .setAuthor({ name: `${process.env.SERVER_NAME} | Anlık Sunucu Durumu`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setThumbnail(message.guild.iconURL({ dynamic: true, size: 4096 }))
            .addFields(
                { name: 'Toplam Üye Sayısı', value: `\`${totalMembers}\``},
                { name: 'Toplam Boost Sayısı', value: `\`${totalBoosts}\``},
                { name: 'Ses Kanallarındaki Toplam Üye Sayısı', value: `\`${voiceMembersCount}\``},
                { name: 'Yayın Açan Üye Sayısı', value: `\`${streamingCount}\``},
                { name: 'Oyun Oynayan Üye Sayısı', value: `\`${activityCount}\``}
            );

        const sentMessage = await message.reply({ embeds: [embed] });
        

        setTimeout(() => {
            sentMessage.delete().catch(console.error);
            message.delete().catch(console.error);
        }, 20000);
    }
};