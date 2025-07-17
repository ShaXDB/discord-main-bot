const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const { addLog, getLogChannel, LOG_TYPES } = require('../database/logDatabase');
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

module.exports = {
  name: Events.MessageDelete,
  once: false,
  async execute(message, client) {
    try {
      
      if (message.author?.bot) return;
    
      if (!message.guild) return;
      
      
      const author = message.author.username;
      const content = message.content || 'İçerik yok (muhtemelen bir embed veya dosya)';
      const timestamp = new Date().toLocaleString();
      
      
      const dbDir = path.join(__dirname, '..', '..', 'database');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      const db = new sqlite3.Database(path.join(dbDir, 'lastDeletedMessage.db'));

      db.run("CREATE TABLE IF NOT EXISTS lastDeletedMessage (author TEXT, content TEXT, timestamp TEXT)", (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log("Tablo başarıyla oluşturuldu veya zaten mevcut.");
        }
      });

      db.run("INSERT INTO lastDeletedMessage (author, content, timestamp) VALUES (?, ?, ?)", [author, content, timestamp], (err) => {
        if (err) {
            console.error(err);
        }
      });
    
      const logChannelId = await getLogChannel(message.guild.id, LOG_TYPES.MESSAGE_LOG);
      if (!logChannelId) return;
      
      const logChannel = message.guild.channels.cache.get(logChannelId);
      if (!logChannel) return;
      
      
      let executor = null;
      let executorText = `${message.author} (kendisi)`;
      
      try {
        const fetchedLogs = await message.guild.fetchAuditLogs({
          limit: 5,
          type: AuditLogEvent.MessageDelete,
        });
        

        const deletionLog = fetchedLogs.entries.first();
        

        if (deletionLog && Date.now() - deletionLog.createdTimestamp < 10000) {
          executor = deletionLog.executor;
          executorText = `${executor} (${executor.id})`;
        }
      } catch (error) {
        console.error('Denetim kaydı alınırken hata oluştu:', error);
      }
    
      await addLog(
        message.guild.id,
        LOG_TYPES.MESSAGE_LOG,
        message.author.id,
        message.channel.id,
        'Mesaj Silindi',
        { 
          username: message.author.tag,
          channel_name: message.channel.name,
          channel_id: message.channel.id,
          content: content,
          executor: executor ? executor.tag : message.author.tag
        }
      );
    
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(`${process.env.SERVER_NAME} | Mesaj Silindi`)
        .setAuthor({ 
          name: message.author.tag, 
          iconURL: message.author.displayAvatarURL({ dynamic: true }) 
        })
        .setDescription(`**${message.author}** kullanıcısının <#${message.channel.id}> kanalındaki mesajı silindi.`)
        .addFields(
          { name: 'Kanal', value: `<#${message.channel.id}>`, inline: true },
          { name: 'Mesaj ID', value: message.id, inline: true },
          { name: 'Silen Kişi', value: executorText, inline: true }
        )
        .setFooter({ text: `Kullanıcı ID: ${message.author.id}` })
        .setTimestamp();
      
      
      if (content.length > 1024) {
        embed.addFields({ name: 'İçerik (Kısaltılmış)', value: content.substring(0, 1021) + '...', inline: false });
      } else {
        embed.addFields({ name: 'İçerik', value: content, inline: false });
      }
    
      if (message.attachments.size > 0) {
        const attachmentList = message.attachments.map(a => a.name || 'Adsız dosya').join(', ');
        embed.addFields({ name: 'Dosyalar', value: attachmentList, inline: false });
      }
    
      await logChannel.send({ embeds: [embed] });
      
    } catch (error) {
      console.error('Mesaj silme olayı loglanırken hata oluştu:', error);
    }
  },
};

const messageUpdate = {
  name: Events.MessageUpdate,
  once: false,
  async execute(oldMessage, newMessage, client) {
    try {
      
      if (oldMessage.author?.bot) return;
    
      if (!oldMessage.guild) return;
      
      
      if (oldMessage.content === newMessage.content) return;
    
      const logChannelId = await getLogChannel(oldMessage.guild.id, LOG_TYPES.MESSAGE_LOG);
      if (!logChannelId) return;
      
      const logChannel = oldMessage.guild.channels.cache.get(logChannelId);
      if (!logChannel) return;
      
      
      const oldContent = oldMessage.content || 'İçerik yok';
      const newContent = newMessage.content || 'İçerik yok';
    
      await addLog(
        oldMessage.guild.id,
        LOG_TYPES.MESSAGE_LOG,
        oldMessage.author.id,
        oldMessage.channel.id,
        'Mesaj Düzenlendi',
        { 
          username: oldMessage.author.tag,
          channel_name: oldMessage.channel.name,
          channel_id: oldMessage.channel.id,
          old_content: oldContent,
          new_content: newContent
        }
      );
    
      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle(`${process.env.SERVER_NAME} | Mesaj Düzenlendi`)
        .setAuthor({ 
          name: oldMessage.author.tag, 
          iconURL: oldMessage.author.displayAvatarURL({ dynamic: true }) 
        })
        .setDescription(`**${oldMessage.author}** kullanıcısı <#${oldMessage.channel.id}> kanalındaki mesajını düzenledi.`)
        .addFields(
          { name: 'Kanal', value: `<#${oldMessage.channel.id}>`, inline: true },
          { name: 'Mesaj ID', value: oldMessage.id, inline: true },
          { name: 'Mesaja Git', value: `[Tıkla](${newMessage.url})`, inline: true }
        )
        .setFooter({ text: `Kullanıcı ID: ${oldMessage.author.id}` })
        .setTimestamp();
      
      
      if (oldContent.length > 1024) {
        embed.addFields({ name: 'Eski İçerik (Kısaltılmış)', value: oldContent.substring(0, 1021) + '...', inline: false });
      } else {
        embed.addFields({ name: 'Eski İçerik', value: oldContent, inline: false });
      }
      
      
      if (newContent.length > 1024) {
        embed.addFields({ name: 'Yeni İçerik (Kısaltılmış)', value: newContent.substring(0, 1021) + '...', inline: false });
      } else {
        embed.addFields({ name: 'Yeni İçerik', value: newContent, inline: false });
      }
    
      await logChannel.send({ embeds: [embed] });
      
    } catch (error) {
      console.error('Mesaj düzenleme olayı loglanırken hata oluştu:', error);
    }
  },
};

module.exports = [module.exports, messageUpdate];