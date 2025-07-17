const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');


const dbDir = path.join(__dirname, '..', '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}


const logDB = new sqlite3.Database(path.join(dbDir, 'logging.db'));


const LOG_TYPES = {
  BAN: 'ban',
  UNBAN: 'unban',
  TIMEOUT: 'timeout',
  UNTIMEOUT: 'untimeout',
  MEMBER_JOIN: 'member-join',
  MEMBER_LEAVE: 'member-leave',
  MEMBER_ROLE_ADD: 'member-role-add',
  MEMBER_ROLE_REMOVE: 'member-role-remove',
  CHANNEL_CREATE: 'channel-create',
  CHANNEL_DELETE: 'channel-delete',
  CHANNEL_UPDATE: 'channel-update',
  ROLE_CREATE: 'role-create',
  ROLE_DELETE: 'role-delete',
  ROLE_UPDATE: 'role-update',
  SERVER_UPDATE: 'server-update',
  VOICE_LOG: 'ses-log',     
  MESSAGE_LOG: 'mesaj-log' 
};


function setupLogDatabase() {

  logDB.run(`CREATE TABLE IF NOT EXISTS log_channels (
    guild_id TEXT,
    log_type TEXT,
    channel_id TEXT,
    PRIMARY KEY (guild_id, log_type)
  )`);


  logDB.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT,
    log_type TEXT,
    user_id TEXT,
    target_id TEXT,
    action TEXT,
    details TEXT,
    timestamp INTEGER
  )`);

  console.log('Log veritabanı kurulumu tamamlandı.');
}

async function setLogChannel(guildId, logType, channelId) {
  return new Promise((resolve, reject) => {
    logDB.run(
      'INSERT OR REPLACE INTO log_channels (guild_id, log_type, channel_id) VALUES (?, ?, ?)',
      [guildId, logType, channelId],
      function(err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      }
    );
  });
}

async function removeLogChannel(guildId, logType) {
  return new Promise((resolve, reject) => {
    logDB.run(
      'DELETE FROM log_channels WHERE guild_id = ? AND log_type = ?',
      [guildId, logType],
      function(err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      }
    );
  });
}

async function getLogChannel(guildId, logType) {
  return new Promise((resolve, reject) => {
    logDB.get(
      'SELECT channel_id FROM log_channels WHERE guild_id = ? AND log_type = ?',
      [guildId, logType],
      (err, row) => {
        if (err) return reject(err);
        resolve(row ? row.channel_id : null);
      }
    );
  });
}

async function getAllLogChannels(guildId) {
  return new Promise((resolve, reject) => {
    logDB.all(
      'SELECT log_type, channel_id FROM log_channels WHERE guild_id = ?',
      [guildId],
      (err, rows) => {
        if (err) return reject(err);
        const channels = {};
        rows.forEach(row => {
          channels[row.log_type] = row.channel_id;
        });
        resolve(channels);
      }
    );
  });
}

async function addLog(guildId, logType, userId, targetId, action, details) {
  if (userId === process.env.CLIENT_ID) return null;
  
  const timestamp = Math.floor(Date.now() / 1000);
  const detailsString = details ? JSON.stringify(details) : '';
  
  return new Promise((resolve, reject) => {
    logDB.run(
      'INSERT INTO logs (guild_id, log_type, user_id, target_id, action, details, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [guildId, logType, userId, targetId, action, detailsString, timestamp],
      function(err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
}

async function getLogs(guildId, logType, limit = 50) {
  return new Promise((resolve, reject) => {
    const query = logType 
      ? 'SELECT * FROM logs WHERE guild_id = ? AND log_type = ? ORDER BY timestamp DESC LIMIT ?'
      : 'SELECT * FROM logs WHERE guild_id = ? ORDER BY timestamp DESC LIMIT ?';
    
    const params = logType 
      ? [guildId, logType, limit]
      : [guildId, limit];
    
    logDB.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = {
  setupLogDatabase,
  setLogChannel,
  removeLogChannel,
  getLogChannel,
  getAllLogChannels,
  addLog,
  getLogs,
  LOG_TYPES
};