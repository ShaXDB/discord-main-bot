const { EmbedBuilder, Colors, PermissionsBitField } = require("discord.js");
require('dotenv').config();

module.exports = {    
    name: "rolal",
    description: "Belirttiğiniz kullanıcıdan rol alır.",
    usage: "rolal <@kullanıcı/ID> <@rol/ID>",
    
    async execute(message, args, client) {

        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && 
            !message.member.roles.cache.has(process.env.ADMIN_ROLE_ID)) {
            return message.reply('Bu komutu kullanmak için yeterli yetkiye sahip değilsiniz!');
        }


        if (!args[0] || !args[1]) {
            return message.reply('Lütfen bir kullanıcı ve rol belirtin! Kullanım: !rolal @kullanıcı @rol');
        }
        

        let userId = args[0].replace(/[<@!>]/g, '');
        let mentionedUser;
        
        try {
            mentionedUser = await message.guild.members.fetch(userId);
        } catch (error) {
            return message.reply('Geçerli bir kullanıcı belirtmelisiniz!');
        }


        let roleId = args[1].replace(/[<@&>]/g, '');
        let role = message.guild.roles.cache.get(roleId);

        if (!role) {
            return message.reply('Geçerli bir rol belirtmelisiniz!');
        }


        const memberHighestRole = message.member.roles.highest;
        const targetHighestRole = mentionedUser.roles.highest;
        if (targetHighestRole.position >= memberHighestRole.position && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('Kendinizden üstteki veya aynı pozisyondaki bir kullanıcıdan rol alamazsınız!');
        }


        if (role.position >= memberHighestRole.position && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('Kendinizden üstteki veya aynı pozisyondaki bir rolü alamazsınız!');
        }


        try {
            await mentionedUser.roles.remove(role);
            message.reply(`${mentionedUser} kullanıcısından ${role} rolü alındı.`);
            

            const logChannel = message.guild.channels.cache.get(process.env.COMMAND_LOG_CHANNEL_ID);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle('Rol Alındı')
                    .setDescription(`**Kullanıcı:** ${mentionedUser} (${mentionedUser.id})\n**Rol:** ${role} (${role.id})\n**Yetkili:** ${message.author} (${message.author.id})`)
                    .setTimestamp();
                
                logChannel.send({ embeds: [logEmbed] });
            }
        } catch (error) {
            console.error(error);
            message.reply('Rol alma işlemi sırasında bir hata oluştu!');
        }
    }
};