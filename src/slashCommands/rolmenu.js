const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolmenu')
        .setDescription('Rol seçme menüsü oluşturur')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Menünün gönderileceği kanal')
                .setRequired(true)),

    async execute(interaction, client) {

        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız!',
                flags: 64
            });
        }

        const channel = interaction.options.getChannel('kanal');


        const gameRolesEmbed = new EmbedBuilder()
            .setColor('#FF5555')
            .setTitle('Oyun Rolleri')
            .setDescription('Aşağıdaki menüden oynamakta olduğunuz oyunların rollerini seçebilirsiniz.')
            .setTimestamp()
            .setImage(process.env.GAME_ROLES_IMAGE_URL) 
            .setFooter({ text: `${process.env.SERVER_NAME} | Oyun Rolleri`, iconURL: interaction.guild.iconURL({ dynamic: true }) });

        const gameRolesMenu = new StringSelectMenuBuilder()
            .setCustomId('game_roles')
            .setPlaceholder('Oyun rollerini seçin...')
            .setMinValues(0)
            .setMaxValues(14)
            .addOptions([
                { label: 'CS2', value: process.env.CS2_ROLE_ID, emoji: process.env.CS2_EMOJI_ID },
                { label: 'League of Legends', value: process.env.LOL_ROLE_ID, emoji: process.env.LOL_EMOJI_ID },
                { label: 'Valorant', value: process.env.VALORANT_ROLE_ID, emoji: process.env.VALORANT_EMOJI_ID },
                { label: 'GTA V', value: process.env.GTA_ROLE_ID, emoji: process.env.GTA_EMOJI_ID },
                { label: 'Lethal Company', value: process.env.AMONG_US_ROLE_ID, emoji: process.env.LETHAL_COMPANY_EMOJI_ID },
                { label: 'Fortnite', value: process.env.FORTNITE_ROLE_ID, emoji: process.env.FORTNITE_EMOJI_ID },
                { label: 'Marvel Rivals', value: process.env.FEIGN_ROLE_ID, emoji: process.env.MARVEL_RIVALS_EMOJI_ID },
                { label: 'Minecraft', value: process.env.MINECRAFT_ROLE_ID, emoji: process.env.MINECRAFT_EMOJI_ID },
                { label: 'Genshin Impact', value: process.env.GENSHIN_ROLE_ID, emoji: process.env.GENSHIN_EMOJI_ID },
                { label: 'Apex Legends', value: process.env.APEX_ROLE_ID, emoji: process.env.APEX_EMOJI_ID },
                { label: 'Rust', value: process.env.FEIGN_ROLE_ID, emoji: process.env.RUST_EMOJI_ID },
                { label: 'Brawlhalla', value: process.env.BRAWLHALLA_ROLE_ID, emoji: process.env.BRAWLHALLA_EMOJI_ID },
                { label: 'Roblox', value: process.env.ROBLOX_ROLE_ID, emoji: process.env.ROBLOX_EMOJI_ID },
                { label: 'Wuthering Waves', value: process.env.FEIGN_ROLE_ID, emoji: process.env.WUTHERING_WAVES_EMOJI_ID }
            ]);
        const gameRolesRow = new ActionRowBuilder().addComponents(gameRolesMenu);

        const zodiacRolesEmbed = new EmbedBuilder()
            .setColor('#5555FF')
            .setTitle('Burç Rolleri')
            .setDescription('Aşağıdaki menüden burcunuzu seçebilirsiniz.')
            .setImage(process.env.ZODIAC_ROLES_IMAGE_URL) 
            .setTimestamp()
            .setFooter({ text: `${process.env.SERVER_NAME} | Burç Rolleri`, iconURL: interaction.guild.iconURL({ dynamic: true }) });

        const zodiacRolesMenu = new StringSelectMenuBuilder()
            .setCustomId('zodiac_roles')
            .setPlaceholder('Burcunuzu seçin...')
            .setMinValues(0)
            .setMaxValues(1) 
            .addOptions([
                new StringSelectMenuOptionBuilder()
                    .setLabel('Koç')
                    .setValue(process.env.ARIES_ROLE_ID)
                    .setDescription('21 Mart - 19 Nisan')
                    .setEmoji('♈'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Boğa')
                    .setValue(process.env.TAURUS_ROLE_ID)
                    .setDescription('20 Nisan - 20 Mayıs')
                    .setEmoji('♉'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('İkizler')
                    .setValue(process.env.GEMINI_ROLE_ID)
                    .setDescription('21 Mayıs - 20 Haziran')
                    .setEmoji('♊'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Yengeç')
                    .setValue(process.env.CANCER_ROLE_ID)
                    .setDescription('21 Haziran - 22 Temmuz')
                    .setEmoji('♋'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Aslan')
                    .setValue(process.env.LEO_ROLE_ID)
                    .setDescription('23 Temmuz - 22 Ağustos')
                    .setEmoji('♌'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Başak')
                    .setValue(process.env.VIRGO_ROLE_ID)
                    .setDescription('23 Ağustos - 22 Eylül')
                    .setEmoji('♍'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Terazi')
                    .setValue(process.env.LIBRA_ROLE_ID)
                    .setDescription('23 Eylül - 22 Ekim')
                    .setEmoji('♎'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Akrep')
                    .setValue(process.env.SCORPIO_ROLE_ID)
                    .setDescription('23 Ekim - 21 Kasım')
                    .setEmoji('♏'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Yay')
                    .setValue(process.env.SAGITTARIUS_ROLE_ID)
                    .setDescription('22 Kasım - 21 Aralık')
                    .setEmoji('♐'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Oğlak')
                    .setValue(process.env.CAPRICORN_ROLE_ID)
                    .setDescription('22 Aralık - 19 Ocak')
                    .setEmoji('♑'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Kova')
                    .setValue(process.env.AQUARIUS_ROLE_ID)
                    .setDescription('20 Ocak - 18 Şubat')
                    .setEmoji('♒'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Balık')
                    .setValue(process.env.PISCES_ROLE_ID)
                    .setDescription('19 Şubat - 20 Mart')
                    .setEmoji('♓')
            ]);

        const zodiacRolesRow = new ActionRowBuilder().addComponents(zodiacRolesMenu);

        const pingRolesEmbed = new EmbedBuilder()
            .setColor('#55FF55')
            .setTitle('Ping Rolleri')
            .setDescription('Aşağıdaki menüden hangi duyurulardan ping almak istediğinizi seçebilirsiniz.')
            .setTimestamp()
            .setImage(process.env.PING_ROLES_IMAGE_URL)
            .setFooter({ text: `${process.env.SERVER_NAME} | Ping Rolleri`, iconURL: interaction.guild.iconURL({ dynamic: true }) });

        const pingRolesMenu = new StringSelectMenuBuilder()
            .setCustomId('ping_roles')
            .setPlaceholder('Ping rollerini seçin...')
            .setMinValues(0)
            .setMaxValues(6) 
            .addOptions([
                { label: 'Karşılama Pingi', value: process.env.WELCOME_PING_ROLE_ID, emoji: process.env.KARSILAMA_EMOJI_ID },
                { label: 'Partner Pingi', value: process.env.PARTNER_PING_ROLE_ID, emoji: process.env.PARTNER_PING_EMOJI_ID },
                { label: 'Etkinlik Pingi', value: process.env.EVENT_PING_ROLE_ID, emoji: process.env.AKTIVITE_EMOJI_ID },
                { label: 'Çekiliş Pingi', value: process.env.GIVEAWAY_PING_ROLE_ID, emoji: process.env.CEKILIS_EMOJI_ID },
                { label: 'Bump Pingi', value: process.env.BUMP_PING_ROLE_ID, emoji: '🔔' },
                { label: 'Dublaj Pingi', value: process.env.DUBLAJ_PING_ROLE_ID, emoji: process.env.DUBLAJ_EMOJI_ID }
            ]);

        const pingRolesRow = new ActionRowBuilder().addComponents(pingRolesMenu);

        const colorRolesEmbed = new EmbedBuilder()
            .setColor('#FFAA55')
            .setTitle('Renk Rolleri')
            .setDescription('Aşağıdaki menüden isminizin rengini seçebilirsiniz.')
            .setTimestamp()
            .setImage(process.env.COLOR_ROLES_IMAGE_URL)
            .setFooter({ text: `${process.env.SERVER_NAME} | Renk Rolleri`, iconURL: interaction.guild.iconURL({ dynamic: true }) });

        const colorRolesMenu = new StringSelectMenuBuilder()
            .setCustomId('color_roles')
            .setPlaceholder('Renk rolünüzü seçin...')
            .setMinValues(0)
            .setMaxValues(1) 
            .addOptions([
                { label: '⋆｡‧˚ʚ✩ɞ˚‧｡⋆', value: process.env.YELLOW_ROLE_ID, emoji: process.env.SARI_EMOJI_ID, description: 'Sarı' },
                { label: '⋆｡‧˚ʚ✩ɞ˚‧｡⋆', value: process.env.ORANGE_ROLE_ID, emoji: process.env.TURUNCU_EMOJI_ID, description: 'Turuncu' },
                { label: '⋆｡‧˚ʚ✩ɞ˚‧｡⋆', value: process.env.WHITE_ROLE_ID, emoji: process.env.BEYAZ_EMOJI_ID, description: 'Beyaz' },
                { label: '⋆｡‧˚ʚ✩ɞ˚‧｡⋆', value: process.env.RED_ROLE_ID, emoji: process.env.KIRMIZI_EMOJI_ID, description: 'Kırmızı' },
                { label: '⋆｡‧˚ʚ✩ɞ˚‧｡⋆', value: process.env.BOOST_PINK_ROLE_ID, emoji: process.env.ACIKPEMBE_EMOJI_ID, description: 'Açık Pembe' },
                { label: '⋆｡‧˚ʚ✩ɞ˚‧｡⋆', value: process.env.BOOST_PURPLE_ROLE_ID, emoji: process.env.MOR_EMOJI_ID, description: 'Mor' },
                { label: '⋆｡‧˚ʚ✩ɞ˚‧｡⋆', value: process.env.BLACK_ROLE_ID, emoji: process.env.SIYAH_EMOJI_ID, description: 'Siyah' },
                { label: '⋆｡‧˚ʚ✩ɞ˚‧｡⋆', value: process.env.DARK_BLUE_ROLE_ID, emoji: process.env.MAVI_EMOJI_ID, description: 'Mavi' },
                { label: '⋆｡‧˚ʚ✩ɞ˚‧｡⋆', value: process.env.GREEN_ROLE_ID, emoji: process.env.YESIL_EMOJI_ID, description: 'Yeşil' },
                { label: '⋆｡‧˚ʚ✩ɞ˚‧｡⋆', value: process.env.PINK_ROLE_ID, emoji: process.env.PEMBE_EMOJI_ID, description: 'Pembe' },
                { label: '⋆｡‧˚ʚ✩ɞ˚‧｡⋆', value: process.env.DARK_GREEN_ROLE_ID, emoji: process.env.KOYUYES_EMOJI_ID, description: 'Koyu Yeşil' },
                { label: '⋆｡‧˚ʚ✩ɞ˚‧｡⋆', value: process.env.DARK_RED_ROLE_ID, emoji: process.env.KOYUKIRMZ_EMOJI_ID, description: 'Koyu kırmızı' },
                { label: '⋆｡‧˚ʚ✩ɞ˚‧｡⋆', value: process.env.BLUE_ROLE_ID, emoji: process.env.TURKUAZ_EMOJI_ID, description: 'Turkuaz' }
            ]);

        const colorRolesRow = new ActionRowBuilder().addComponents(colorRolesMenu);

        await channel.send({ embeds: [gameRolesEmbed], components: [gameRolesRow] });
        await channel.send({ embeds: [zodiacRolesEmbed], components: [zodiacRolesRow] });
        await channel.send({ embeds: [pingRolesEmbed], components: [pingRolesRow] });
        await channel.send({ embeds: [colorRolesEmbed], components: [colorRolesRow] });

        await interaction.reply({
            content: `Rol menüleri başarıyla ${channel} kanalına gönderildi!`,  
            flags: 64
        });
    }
};
