const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: "ytver",
    description: "Belirtilen kullanıcıya yetkili rolü verir.",
    usage: "ytver <@kullanıcı/ID>",
    
    async execute(message, args, client) {
        const onayemoji = `<a:onay:${process.env.ONAY_EMOJI_ID}>`; 
        const ytverlog = process.env.YTVERLOG_CHANNEL_ID;

        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('Yeterli Yetkin Bulunmamakta');
        }

  
        if (!args[0]) {
            return message.reply('Lütfen yetkili yapılacak bir kullanıcı belirtin!');
        }

   
        let userId = args[0].replace(/[<@!>]/g, '');
        let member;
        
        try {
            member = await message.guild.members.fetch(userId);
        } catch (error) {
            return message.reply('Geçerli bir kullanıcı belirtmelisiniz!');
        }

        const rolesData = [
            { name: 'Deneme Yetkili', roles: [process.env.DENEME_YETKILI_ROLE_ID] },
            { name: 'Tenshi', roles: [process.env.TENSHI_ROLE_ID, process.env.WARNHAMMER_ROLE_ID] },
            { name: 'Akuma', roles: [process.env.AKUMA_ROLE_ID, process.env.WARNHAMMER_ROLE_ID, process.env.MUTEHAMMER_ROLE_ID] },
            { name: 'Sekai', roles: [process.env.SEKAI_ROLE_ID, process.env.MUTEHAMMER_ROLE_ID, process.env.WARNHAMMER_ROLE_ID] },
            { name: 'Shogun', roles: [process.env.SHOGUN_ROLE_ID, process.env.WARNHAMMER_ROLE_ID, process.env.MUTEHAMMER_ROLE_ID] },
            { name: "Soryu", roles:[process.env.SORYU_ROLE_ID, process.env.WARNHAMMER_ROLE_ID, process.env.MUTEHAMMER_ROLE_ID] },
            { name: 'Sensei', roles: [process.env.SENSEI_ROLE_ID, process.env.WARNHAMMER_ROLE_ID, process.env.MUTEHAMMER_ROLE_ID, process.env.BANHAMMER_ROLE_ID] },
            { name: 'Yonkou', roles: [process.env.YONKOU_ROLE_ID, process.env.WARNHAMMER_ROLE_ID, process.env.MUTEHAMMER_ROLE_ID, process.env.BANHAMMER_ROLE_ID] },
            { name: 'Oni', roles: [process.env.ONI_ROLE_ID, process.env.WARNHAMMER_ROLE_ID, process.env.MUTEHAMMER_ROLE_ID, process.env.BANHAMMER_ROLE_ID] },
            { name: 'Shinsei', roles: [process.env.SHINSEI_ROLE_ID, process.env.WARNHAMMER_ROLE_ID, process.env.MUTEHAMMER_ROLE_ID, process.env.BANHAMMER_ROLE_ID] }
        ];

        const options = rolesData.map(roleData => {
            return new StringSelectMenuOptionBuilder()
                .setLabel(roleData.name)
                .setValue(roleData.name)
                .setDescription(`${roleData.name} rolünü vermek için tıklayınız.`);
        });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_role')
            .setPlaceholder('Bir rol seçin...')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setAuthor({ 
                name: message.author.username, 
                iconURL: message.author.displayAvatarURL({ dynamic: true }) 
            })
            .setDescription(`Lütfen ${member} kullanıcısına verilecek yetkiyi seçin:`)
            .setTimestamp()
            .setThumbnail(message.guild.iconURL({ dynamic: true, size: 4096 }));

        const msg = await message.reply({ 
            embeds: [embed], 
            components: [row]
        });

        const collector = msg.createMessageComponentCollector({ 
            componentType: ComponentType.StringSelect, 
            time: 60000 
        });

        collector.on('collect', async i => {
    
            if (i.user.id !== message.author.id) {
                return i.reply({ 
                    content: 'Bu menüyü sadece komutu kullanan kişi kullanabilir!', 
                    flags: 64 
                });
            }

            const selectedOption = i.values[0];
            const selectedRoleData = rolesData.find(roleData => roleData.name === selectedOption);
            
            if (selectedRoleData) {
                try {
                    await member.roles.add(selectedRoleData.roles);
                    
                    const basariliembed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setAuthor({ 
                            name: message.author.username, 
                            iconURL: message.author.displayAvatarURL({ dynamic: true }) 
                        })
                        .setDescription(`<@${message.author.id}> adlı yetkili <@${member.id}> (\`${member.id}\`) kişisini \`${selectedRoleData.name}\` adlı yetkiye başlattı.`)
                        .setTimestamp()
                        .setThumbnail(message.guild.iconURL({ dynamic: true, size: 4096 }));
                    
                    await message.guild.channels.cache.get(ytverlog).send({ 
                        embeds: [basariliembed] 
                    });
                    
                    await i.update({ 
                        content: `Başarıyla ${selectedRoleData.name} rolü verildi! ${onayemoji}`, 
                        embeds: [], 
                        components: [] 
                    });
                } catch (error) {
                    console.error('Rol verme hatası:', error);
                    await i.update({ 
                        content: 'Rol verirken bir hata oluştu!', 
                        embeds: [], 
                        components: [] 
                    });
                }
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                msg.edit({ 
                    content: 'Süre doldu, herhangi bir rol seçilmedi.', 
                    embeds: [], 
                    components: [] 
                });
            }
        });
    }
};