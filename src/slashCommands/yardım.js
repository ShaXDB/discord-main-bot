const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("yardım")
        .setDescription("Tüm komutları ve açıklamalarını gösterir.")
        .addStringOption(option =>
            option.setName('komut')
                .setDescription('Hakkında bilgi almak istediğiniz komut')
                .setRequired(false)),
    
    async execute(interaction, client) {
        const komutAdı = interaction.options.getString('komut');
        

        const moderasyonKomutları = ['ban', 'unban', 'mute', 'unmute'];
        const genel = ['say', 'git', 'yetkilibilgi'];
        const yetkili = ['ytver'];
        

        if (komutAdı) {
            const komut = client.slashCommands.get(komutAdı);
            
            if (!komut || ['setcommandrole', 'setlogchannel', 'rolmenu'].includes(komut.data.name)) {
                return interaction.reply({ content: 'Belirtilen komut bulunamadı!', flags: 64 });
            }
            
            const komutEmbed = new EmbedBuilder()
                .setColor('#65b5af')
                .setTitle(`/${komut.data.name} Komutu Hakkında Bilgi`)
                .addFields(
                    { name: 'Komut', value: komut.data.name, inline: true },
                    { name: 'Açıklama', value: komut.data.description || 'Açıklama yok', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `${process.env.SERVER_NAME} | Yardım Sistemi`, iconURL: interaction.guild.iconURL({ dynamic: true }) });
            

            const options = komut.data.options;
            if (options && options.length > 0) {
                const optionsText = options.map(opt => 
                    `\`${opt.name}\`: ${opt.description} ${opt.required ? '(Gerekli)' : '(İsteğe bağlı)'}`
                ).join('\n');
                
                komutEmbed.addFields({ name: 'Parametreler', value: optionsText, inline: false });
            }
            
            return interaction.reply({ embeds: [komutEmbed], flags: 64 });
        }
        

        const yardımEmbed = new EmbedBuilder()
            .setColor('#65b5af')
            .setTitle(`${process.env.SERVER_NAME} | Slash Komut Listesi`)
            .setDescription(`Aşağıda kullanabileceğiniz slash komutların bir listesi bulunmaktadır.\nBir komut hakkında daha fazla bilgi için \`/yardım komut:[komut adı]\` kullanabilirsiniz.`)
            .addFields(
                { 
                    name: '🛡️ Moderasyon Komutları', 
                    value: moderasyonKomutları.map(k => `\`/${k}\``).join(', '), 
                    inline: false 
                },
                { 
                    name: '🌐 Genel Komutlar', 
                    value: genel.map(k => `\`/${k}\``).join(', '), 
                    inline: false 
                },
                { 
                    name: '⚙️ Yetkili Komutları', 
                    value: yetkili.map(k => `\`/${k}\``).join(', '), 
                    inline: false 
                }
            )
            .setTimestamp()
            .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 4096 }))
            .setFooter({ text: `${process.env.SERVER_NAME} | Yardım Sistemi`, iconURL: interaction.guild.iconURL({ dynamic: true }) });
        
        await interaction.reply({ embeds: [yardımEmbed], flags: 64 });
    }
};