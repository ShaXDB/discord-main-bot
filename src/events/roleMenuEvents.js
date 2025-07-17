const { Events } = require('discord.js');
require('dotenv').config();

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction, client) {

    if (!interaction.isStringSelectMenu()) return;

    try {

      if (interaction.customId === 'game_roles') {
        await handleGameRoles(interaction);
      }
    
      else if (interaction.customId === 'zodiac_roles') {
        await handleZodiacRoles(interaction);
      }
    
      else if (interaction.customId === 'ping_roles') {
        await handlePingRoles(interaction);
      }
    
      else if (interaction.customId === 'color_roles') {
        await handleColorRoles(interaction);
      }
    } catch (error) {
      console.error('Rol menüsü işlenirken hata oluştu:', error);
      
  
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ 
          content: 'Rol işlenirken bir hata oluştu!', 
          flags: 64 
        });
      } else {
        await interaction.reply({ 
          content: 'Rol işlenirken bir hata oluştu!', 
          flags: 64 
        });
      }
    }
  }
};


async function handleGameRoles(interaction) {
  const member = interaction.member;
  const selectedRoles = interaction.values;
  
  
  const allGameRoles = [
    process.env.CS2_ROLE_ID, // CS2
    process.env.LOL_ROLE_ID, // League of Legends
    process.env.VALORANT_ROLE_ID, // Valorant
    process.env.GTA_ROLE_ID, // GTA V
    process.env.AMONG_US_ROLE_ID, // Among Us
    process.env.FORTNITE_ROLE_ID, // Fortnite
    process.env.ROBLOX_ROLE_ID, // Roblox
    process.env.MINECRAFT_ROLE_ID, // Minecraft
    process.env.GENSHIN_ROLE_ID, // Genshin Impact
    process.env.APEX_ROLE_ID, // Apex Legends
    process.env.FEIGN_ROLE_ID, // Feign
    process.env.BRAWLHALLA_ROLE_ID  // Brawlhalla
  ];
  
  
  const userGameRoles = member.roles.cache.filter(role => 
    allGameRoles.includes(role.id)
  );

  for (const role of userGameRoles.values()) {
    if (!selectedRoles.includes(role.id)) {
      await member.roles.remove(role.id);
    }
  }

  for (const roleId of selectedRoles) {
    if (!member.roles.cache.has(roleId)) {
      await member.roles.add(roleId);
    }
  }
  
  await interaction.reply({ 
    content: 'Oyun rolleriniz güncellendi!', 
    flags: 64 
  });
}


async function handleZodiacRoles(interaction) {
  const member = interaction.member;
  const selectedRole = interaction.values[0]; // Sadece bir burç seçilebilir
  
  
  const allZodiacRoles = [
    process.env.ARIES_ROLE_ID, // Koç
    process.env.TAURUS_ROLE_ID, // Boğa
    process.env.GEMINI_ROLE_ID, // İkizler
    process.env.CANCER_ROLE_ID, // Yengeç
    process.env.LEO_ROLE_ID, // Aslan
    process.env.VIRGO_ROLE_ID, // Başak
    process.env.LIBRA_ROLE_ID, // Terazi
    process.env.SCORPIO_ROLE_ID, // Akrep
    process.env.SAGITTARIUS_ROLE_ID, // Yay
    process.env.CAPRICORN_ROLE_ID, // Oğlak
    process.env.AQUARIUS_ROLE_ID, // Kova
    process.env.PISCES_ROLE_ID  // Balık
  ];
  
  
  const userZodiacRoles = member.roles.cache.filter(role => 
    allZodiacRoles.includes(role.id)
  );

  for (const role of userZodiacRoles.values()) {
    await member.roles.remove(role.id);
  }

  if (selectedRole) {
    await member.roles.add(selectedRole);
  }
  
  await interaction.reply({ 
    content: selectedRole ? 'Burç rolünüz güncellendi!' : 'Burç rolünüz kaldırıldı!', 
    flags: 64 
  });
}


async function handlePingRoles(interaction) {
  const member = interaction.member;
  const selectedRoles = interaction.values;
  
  
  const allPingRoles = [
    process.env.WELCOME_PING_ROLE_ID, // Karşılama Pingi
    process.env.PARTNER_PING_ROLE_ID, // Partner Pingi
    process.env.EVENT_PING_ROLE_ID, // Etkinlik Pingi
    process.env.GIVEAWAY_PING_ROLE_ID, // Çekiliş Pingi
    process.env.BUMP_PING_ROLE_ID, // Bump Pingi
    process.env.DUBLAJ_PING_ROLE_ID  // Dublaj Pingi
  ];
  
  
  const userPingRoles = member.roles.cache.filter(role => 
    allPingRoles.includes(role.id)
  );

  for (const role of userPingRoles.values()) {
    if (!selectedRoles.includes(role.id)) {
      await member.roles.remove(role.id);
    }
  }

  for (const roleId of selectedRoles) {
    if (!member.roles.cache.has(roleId)) {
      await member.roles.add(roleId);
    }
  }
  
  await interaction.reply({ 
    content: 'Ping rolleriniz güncellendi!', 
    flags: 64 
  });
}


async function handleColorRoles(interaction) {
  const member = interaction.member;
  const selectedRole = interaction.values[0]; // Sadece bir renk seçilebilir
  
  
  const allColorRoles = [
    process.env.YELLOW_ROLE_ID, // Sarı 
    process.env.ORANGE_ROLE_ID, // Turuncu
    process.env.WHITE_ROLE_ID, // Beyaz
    process.env.RED_ROLE_ID, // Kırmızı
    process.env.BOOST_PINK_ROLE_ID, // Boost Pembe
    process.env.BOOST_PURPLE_ROLE_ID, // Boost Mor
    process.env.BLACK_ROLE_ID, // Siyah
    process.env.DARK_BLUE_ROLE_ID, // Kapalı Mavi
    process.env.GREEN_ROLE_ID, // Yeşil
    process.env.PINK_ROLE_ID, // Pembe
    process.env.DARK_GREEN_ROLE_ID, // Kapalı Yeşil
    process.env.DARK_RED_ROLE_ID, // Kapalı Kırmızı
    process.env.BLUE_ROLE_ID  // Mavi
  ];
  
  
  const userColorRoles = member.roles.cache.filter(role => 
    allColorRoles.includes(role.id)
  );

  for (const role of userColorRoles.values()) {
    await member.roles.remove(role.id);
  }

  if (selectedRole) {
    await member.roles.add(selectedRole);
  }
  
  await interaction.reply({ 
    content: selectedRole ? 'Renk rolünüz güncellendi!' : 'Renk rolünüz kaldırıldı!', 
    flags: 64 
  });
}