const { SlashCommandBuilder, EmbedBuilder, Colors, PermissionsBitField } = require("discord.js");
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rolver")
        .setDescription("Belirttiğiniz kullanıcıya rol verir.")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("Rol verilecek kullanıcı.")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName("rol")
                .setDescription("Verilecek rol.")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) && 
            !interaction.member.roles.cache.has(process.env.ADMIN_ROLE_ID)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yeterli yetkiye sahip değilsiniz!', flags: 64 });
        }

        const mentionedUser = interaction.options.getMember('user');
        const role = interaction.options.getRole('rol');

        if (!mentionedUser) {
            return interaction.reply({ content: 'Geçerli bir kullanıcı belirtmelisiniz!', flags: 64 });
        }

        if (!role) {
            return interaction.reply({ content: 'Geçerli bir rol belirtmelisiniz!', flags: 64 });
        }

        const memberHighestRole = interaction.member.roles.highest;
        if (role.position >= memberHighestRole.position) {
            return interaction.reply({ content: 'Kendinizden daha yüksek bir rol veremezsiniz!', flags: 64 });
        }
        try {
            await mentionedUser.roles.add(role);
            interaction.reply({ content: `${mentionedUser} kullanıcısına ${role} rolü verildi.` });
            
            const logChannel = interaction.guild.channels.cache.get(process.env.COMMAND_LOG_CHANNEL_ID);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Rol Verildi')
                    .setDescription(`**Kullanıcı:** ${mentionedUser} (${mentionedUser.id})\n**Rol:** ${role} (${role.id})\n**Yetkili:** ${interaction.user} (${interaction.user.id})`)
                    .setTimestamp();
                
                logChannel.send({ embeds: [logEmbed] });
            }
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'Rol verme işlemi sırasında bir hata oluştu!', flags: 64 });
        }
    }
};