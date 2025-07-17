const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: "yardım",
    description: "Tüm komutları ve açıklamalarını gösterir.",
    usage: "yardım [komut adı]",
    
    async execute(message, args, client) {
        const prefix = process.env.PREFIX || "."; 
        

        const moderasyonKomutları = ['ban', 'unban', 'mute', 'unmute'];
        const genel = ['say', 'git', 'yetkilibilgi'];
        const yetkili = ['ytver'];
        

        if (args[0]) {
            const komutAdı = args[0].toLowerCase();
            const komut = client.commands.get(komutAdı) || 
                          client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(komutAdı));
            
            if (!komut || ['setcommandrole', 'setlogchannel', 'rolemenu'].includes(komut.name)) {
                return message.reply('Belirtilen komut bulunamadı!');
            }
            
            const komutEmbed = new EmbedBuilder()
                .setColor('#65b5af')
                .setTitle(`${prefix}${komut.name} Komutu Hakkında Bilgi`)
                .addFields(
                    { name: 'Komut', value: komut.name, inline: true },
                    { name: 'Açıklama', value: komut.description || 'Açıklama yok', inline: true },
                    { name: 'Kullanım', value: `${prefix}${komut.usage || komut.name}`, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: `${process.env.SERVER_NAME} | Yardım Sistemi`, iconURL: message.guild.iconURL({ dynamic: true }) });
            
            if (komut.aliases) {
                komutEmbed.addFields({ name: 'Alternatifler', value: komut.aliases.join(', '), inline: true });
            }
            
            return message.reply({ embeds: [komutEmbed] });
        }
        

        const yardımEmbed = new EmbedBuilder()
            .setColor('#65b5af')
            .setTitle(`${process.env.SERVER_NAME} | Komut Listesi`)
            .setDescription(`Aşağıda kullanabileceğiniz komutların bir listesi bulunmaktadır.\nBir komut hakkında daha fazla bilgi için \`${prefix}yardım [komut adı]\` yazabilirsiniz.`)
            .addFields(
                { 
                    name: '🛡️ Moderasyon Komutları', 
                    value: moderasyonKomutları.map(k => `\`${prefix}${k}\``).join(', '), 
                    inline: false 
                },
                { 
                    name: '🌐 Genel Komutlar', 
                    value: genel.map(k => `\`${prefix}${k}\``).join(', '), 
                    inline: false 
                },
                { 
                    name: '⚙️ Yetkili Komutları', 
                    value: yetkili.map(k => `\`${prefix}${k}\``).join(', '), 
                    inline: false 
                }
            )
            .setTimestamp()
            .setThumbnail(message.guild.iconURL({ dynamic: true, size: 4096 }))
            .setFooter({ text: `${process.env.SERVER_NAME} | Yardım Sistemi`, iconURL: message.guild.iconURL({ dynamic: true }) });
        
        await message.reply({ embeds: [yardımEmbed] });
    }
};
