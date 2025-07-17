const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("yetkilibilgi")
        .setDescription("Sunucudaki yetkililerin bilgilerini gösterir."),
    
    async execute(interaction, client) {

        const guild = interaction.guild;
        const roleIds = {
            Yogen: process.env.YOGEN_ROLE_ID,
            Shinsei: process.env.SHINSEI_ROLE_ID,
            Oni: process.env.ONI_ROLE_ID,
            Yonkou: process.env.YONKOU_ROLE_ID,
            Sensei: process.env.SENSEI_ROLE_ID,
            Soryu: process.env.SORYU_ROLE_ID,
            Shogun: process.env.SHOGUN_ROLE_ID,
            Sekai: process.env.SEKAI_ROLE_ID,
            Akuma: process.env.AKUMA_ROLE_ID,
            Tenshi: process.env.TENSHI_ROLE_ID
        };

        const roleInfo = Object.entries(roleIds).map(([roleName, roleId]) => {
            const membersWithRole = guild.members.cache.filter(member => 
                member.roles.cache.has(roleId)
            );
            const count = membersWithRole.size;
            const mention = membersWithRole.map(member => 
                member.toString()
            ).join(', ');
            return { roleName, count, mention };
        });

        const embed = new EmbedBuilder()
            .setColor('#d8d8d8')
            .setAuthor({ 
                name: `${process.env.SERVER_NAME} | Yetkili Görüntüleme`, 
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
            })
            .setTimestamp()
            .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 4096 }))
            .addFields(roleInfo.map(info => {
                const mentionValue = info.mention ? info.mention : 'Bu Rolde Henüz Bir Yetkilimiz Yok!';
                return {
                    name: `**__${info.roleName}__** yetkisindeki kişi sayısı \`${info.count}\``,
                    value: mentionValue
                };
            }));

        await interaction.reply({ embeds: [embed] });
    }
};