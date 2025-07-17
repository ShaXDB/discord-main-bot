const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require('discord.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ytver")
        .setDescription("Belirtilen kullanıcıya yetkili rolü verir.")
        .addUserOption(option =>
            option.setName("kullanıcı")
                .setDescription("Yetkili yapılacak kullanıcı.")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const onayemoji = `<a:onay:${process.env.ONAY_EMOJI_ID}>`;
        const ytverlog = process.env.YTVERLOG_CHANNEL_ID;

        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ 
                content: 'Yeterli Yetkin Bulunmamakta', 
                flags: 64 
            });
        }

        const member = interaction.options.getMember('kullanıcı');

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
                name: interaction.user.username, 
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
            })
            .setDescription(`Lütfen ${member} kullanıcısına verilecek yetkiyi seçin:`)
            .setTimestamp()
            .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 4096 }));

        const msg = await interaction.reply({ 
            embeds: [embed], 
            components: [row], 
            fetchReply: true 
        });

        const collector = msg.createMessageComponentCollector({ 
            componentType: ComponentType.StringSelect, 
            time: 60000 
        });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
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
                            name: interaction.user.username, 
                            iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
                        })
                        .setDescription(`<@${interaction.user.id}> adlı yetkili <@${member.id}> (\`${member.id}\`) kişisini \`${selectedRoleData.name}\` adlı yetkiye başlattı.`)
                        .setTimestamp()
                        .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 4096 }));
                    
                    await interaction.guild.channels.cache.get(ytverlog).send({ 
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
                interaction.editReply({ 
                    content: 'Süre doldu, herhangi bir rol seçilmedi.', 
                    embeds: [], 
                    components: [] 
                });
            }
        });
    }
};