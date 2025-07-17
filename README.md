# Main Discord Bot - Discord Moderation and Logging Bot

**Bu Discord Botu**, Discord sunucuları için geliştirilmiş kapsamlı bir moderasyon ve loglama botudur. Türkçe dil desteği ile sunucunuzun güvenliğini ve düzenini sağlar.

## 🌟 Özellikler

### 🛡️ Moderasyon Sistemi
- **Ban/Unban**: Kullanıcıları sunucudan yasaklama ve yasak kaldırma
- **Timeout/Untimeout**: Geçici susturma (28 güne kadar) ve susturma kaldırma
- **Uyarı Sistemi**: Kullanıcılara uyarı verme, görüntüleme ve ID ile silme
- **Otomatik Ban**: 5 uyarıya ulaşan kullanıcıları otomatik yasaklama
- **Rol Yönetimi**: Kullanıcılara rol verme ve alma işlemleri

### 📊 Kapsamlı Loglama Sistemi
- **Moderasyon Logları**: Ban, unban, timeout, untimeout işlemleri
- **Üye Hareketleri**: Sunucuya katılma/ayrılma, rol değişiklikleri
- **Kanal Yönetimi**: Kanal oluşturma, silme, güncelleme işlemleri
- **Rol Yönetimi**: Rol oluşturma, silme, güncelleme işlemleri
- **Mesaj Logları**: Silinen mesajları takip etme ve veritabanında saklama
- **Ses Kanalı Logları**: Kullanıcıların ses kanalı hareketlerini izleme
- **Sunucu Güncellemeleri**: Sunucu ayarları, emoji ve sticker değişiklikleri

### 🔐 Gelişmiş Yetki Sistemi
- **Komut Bazlı Yetkiler**: Her komut için özel rol yetkilendirmesi
- **Dinamik Yetki Yönetimi**: Rollerin komut yetkilerini ayarlama/kaldırma
- **Güvenlik Kontrolleri**: Kendi kendini banlama/susturma koruması
- **Rol Hiyerarşisi**: Üst düzey rollere müdahale engelleme
- **Yetkili Rol Sistemi**: Özel yetkili rolleri (Deneme Yetkili, Tenshi, Akuma) atama

### ✨ Özel Özellikler
- **Otomatik Üye Karşılama**: Yeni üyeleri özel mesajlarla ve rol atamasıyla karşılama
- **İnteraktif Rol Menüleri**: Oyun, burç, ping ve renk rolleri için seçim menüleri
- **Ses Kanalı Davet Sistemi**: Kullanıcıları ses kanalına davet etme sistemi
- **Sunucu İstatistikleri**: Anlık üye, boost, ses ve oyun istatistikleri
- **Yetkili Listesi**: Sunucu yetkililerini hiyerarşik olarak listeleme
- **Silinen Mesaj Takibi**: Son silinen mesajı veritabanında saklama

## 🔧 Kurulum

### Gereksinimler
- Node.js (v16 veya üzeri)
- npm veya yarn
- Discord Bot Token

### Adımlar

1. **Projeyi klonlayın:**
   ```bash
   git clone <repository-url>
   cd discord-main-bot
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Ortam değişkenlerini ayarlayın:**
   `.env` dosyası oluşturun ve gerekli değişkenleri ekleyin:
   ```env
   # Bot Temel Ayarları
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_bot_client_id
   GUILD_ID=your_guild_id
   SERVER_NAME=Your Server Name
   
   # Kanal ID'leri
   WELCOME_CHANNEL_ID=kanal_id
   RULES_CHANNEL_ID=kanal_id
   ROLE_CHANNEL_ID=kanal_id
   ANNOUNCEMENT_CHANNEL_ID=kanal_id
   
   # Rol ID'leri (Yetkili Rolleri)
   ADMIN_ROLE_ID=rol_id
   MEMBER_ROLE_ID=rol_id
   WELCOME_PING_ROLE_ID=rol_id
   
   # Oyun Rolleri
   CS2_ROLE_ID=rol_id
   VALORANT_ROLE_ID=rol_id
   LOL_ROLE_ID=rol_id
   # ... diğer oyun rolleri
   
   # Burç Rolleri
   ARIES_ROLE_ID=rol_id
   TAURUS_ROLE_ID=rol_id
   # ... diğer burç rolleri
   
   # Renk Rolleri
   RED_ROLE_ID=rol_id
   BLUE_ROLE_ID=rol_id
   # ... diğer renk rolleri
   
   # Özel Ayarlar
   WELCOME_IMAGE_URL=resim_url
   KALP_EMOJI_ID=emoji_id
   ```

4. **Botu başlatın:**
   ```bash
   npm start
   # veya geliştirme modu için
   npm run dev
   ```

## ⚙️ Konfigürasyon

### 📊 Log Türleri
Bot aşağıdaki kapsamlı log türlerini destekler:

#### Moderasyon Logları
- `BAN` - Ban işlemleri
- `UNBAN` - Unban işlemleri
- `TIMEOUT` - Timeout işlemleri
- `UNTIMEOUT` - Untimeout işlemleri

#### Üye Hareketleri
- `MEMBER_JOIN` - Üye katılma
- `MEMBER_LEAVE` - Üye ayrılma
- `MEMBER_ROLE_ADD` - Üyeye rol ekleme
- `MEMBER_ROLE_REMOVE` - Üyeden rol çıkarma

#### Kanal Yönetimi
- `CHANNEL_CREATE` - Kanal oluşturma
- `CHANNEL_DELETE` - Kanal silme
- `CHANNEL_UPDATE` - Kanal güncelleme

#### Rol Yönetimi
- `ROLE_CREATE` - Rol oluşturma
- `ROLE_DELETE` - Rol silme
- `ROLE_UPDATE` - Rol güncelleme

#### Diğer Loglar
- `MESSAGE_LOG` - Mesaj logları (silinen mesajlar)
- `VOICE_LOG` - Ses kanalı hareketleri
- `SERVER_UPDATE` - Sunucu güncellemeleri (isim, ikon, banner, emoji, sticker)

### 🗄️ Veritabanı Yapısı
Bot SQLite veritabanı kullanır ve üç ana veritabanı dosyası oluşturur:
- `modDatabase.db` - Moderasyon verileri (yetkiler, komut logları, uyarılar)
- `logDatabase.db` - Log verileri ve kanal ayarları
- `lastDeletedMessage.db` - Son silinen mesaj bilgileri

## 🔑 Gerekli Bot İzinleri

Botun düzgün çalışması için aşağıdaki izinlere ihtiyacı vardır:

### Temel İzinler
- `Send Messages` - Mesaj gönderme
- `Embed Links` - Embed mesajları gönderme
- `Read Message History` - Mesaj geçmişini okuma
- `Use Slash Commands` - Slash komutları kullanma
- `Add Reactions` - Reaksiyon ekleme
- `Use External Emojis` - Harici emojiler kullanma

### Moderasyon İzinleri
- `Ban Members` - Üyeleri yasaklama
- `Kick Members` - Üyeleri atma
- `Timeout Members` - Üyeleri susturma
- `Manage Roles` - Rolleri yönetme
- `View Audit Log` - Denetim kayıtlarını görme
- `Moderate Members` - Üyeleri moderasyon

### Yönetim İzinleri
- `Manage Channels` - Kanalları yönetme
- `Manage Messages` - Mesajları yönetme
- `Connect` - Ses kanallarına bağlanma
- `Move Members` - Üyeleri ses kanalları arasında taşıma
- `Speak` - Ses kanallarında konuşma
- `Manage Server` - Sunucu yönetimi (log kanalları için)

## 📁 Proje Yapısı

```
src/
├── commands/              # Prefix komutları
│   ├── ban.js            # Ban komutu
│   ├── unban.js          # Unban komutu
│   ├── timeout.js        # Timeout komutu (mute)
│   ├── untimeout.js      # Untimeout komutu
│   ├── warn.js           # Uyarı sistemi
│   ├── rolver.js         # Rol verme
│   ├── rolal.js          # Rol alma
│   ├── ytver.js          # Yetkili rol atama
│   ├── setlogchannel.js  # Log kanalı ayarlama
│   ├── setcommandrole.js # Komut yetki ayarlama
│   ├── say.js            # Sunucu istatistikleri
│   ├── yetkilibilgi.js   # Yetkili listesi
│   ├── git.js            # Ses kanalı davet
│   └── yardım.js         # Yardım komutu
├── slashCommands/         # Slash komutları (prefix ile aynı)
│   ├── rolmenu.js        # İnteraktif rol menüsü
│   └── ...
├── events/                # Bot olayları
│   ├── ready.js          # Bot hazır olayı
│   ├── memberEvents.js   # Üye güncelleme olayları
│   ├── memberWelcome.js  # Üye karşılama
│   ├── guildEvents.js    # Sunucu olayları (join/leave/ban)
│   ├── channelEvents.js  # Kanal olayları
│   ├── roleEvents.js     # Rol olayları
│   ├── messageEvents.js  # Mesaj olayları
│   ├── voiceEvents.js    # Ses kanalı olayları
│   ├── serverEvents.js   # Sunucu güncelleme olayları
│   ├── roleMenuEvents.js # Rol menüsü etkileşimleri
│   └── voiceConnect.js   # Ses kanalı bağlantı olayları
├── database/              # Veritabanı işlemleri
│   ├── modDatabase.js    # Moderasyon veritabanı
│   └── logDatabase.js    # Log veritabanı
└── index.js              # Ana dosya
```

## 🔒 Güvenlik Özellikleri

- **Kendi Kendini Koruma**: Bot kendi kendini banlayamaz/susturamaz
- **Rol Hiyerarşisi**: Üst düzey rollere müdahale engelleme
- **Komut Bazlı Yetkiler**: Her komut için özel rol yetkilendirmesi
- **Audit Log Takibi**: Tüm işlemlerin denetim kaydı
- **Otomatik Güvenlik**: 5 uyarıda otomatik ban sistemi
- **Zaman Sınırları**: Timeout süresi maksimum 28 gün

## 🎯 Özel Özellikler

### İnteraktif Rol Menüleri
- **Oyun Rolleri**: 12 farklı oyun (CS2, Valorant, LOL, GTA V, vb.)
- **Burç Rolleri**: 12 burç işareti
- **Ping Rolleri**: 6 farklı ping türü (Karşılama, Etkinlik, Çekiliş, vb.)
- **Renk Rolleri**: 13 farklı renk seçeneği

### Otomatik Sistemler
- **Üye Karşılama**: Özel mesaj ve otomatik rol atama
- **Uyarı Sistemi**: Otomatik ban ve uyarı takibi
- **Log Sistemi**: 15+ farklı log türü
- **Ses Kanalı Davet**: Kullanıcılar arası ses kanalı davet sistemi

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 Destek

Sorularınız veya sorunlarınız için GitHub Issues kullanabilirsiniz.

---