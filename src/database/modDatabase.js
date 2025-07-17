const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');


const dbDir = path.join(__dirname, '..', '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const modDB = new sqlite3.Database(path.join(dbDir, 'moderation.db'));


function setupModDatabase() {
  modDB.run(`CREATE TABLE IF NOT EXISTS command_permissions (
    guild_id TEXT,
    command_name TEXT,
    role_id TEXT,
    PRIMARY KEY (guild_id, command_name, role_id)
  )`);

  modDB.run(`CREATE TABLE IF NOT EXISTS command_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT,
    user_id TEXT,
    command_name TEXT,
    arguments TEXT,
    timestamp INTEGER
  )`);

  console.log('Moderasyon veritabanı kurulumu tamamlandı.');
}


async function addCommandPermission(guildId, commandName, roleId) {
  return new Promise((resolve, reject) => {
    modDB.run(
      'INSERT OR IGNORE INTO command_permissions (guild_id, command_name, role_id) VALUES (?, ?, ?)',
      [guildId, commandName, roleId],
      function(err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      }
    );
  });
}


async function removeCommandPermission(guildId, commandName, roleId) {
  return new Promise((resolve, reject) => {
    modDB.run(
      'DELETE FROM command_permissions WHERE guild_id = ? AND command_name = ? AND role_id = ?',
      [guildId, commandName, roleId],
      function(err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      }
    );
  });
}


async function getCommandPermissions(guildId, commandName) {
  return new Promise((resolve, reject) => {
    modDB.all(
      'SELECT role_id FROM command_permissions WHERE guild_id = ? AND command_name = ?',
      [guildId, commandName],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows.map(row => row.role_id));
      }
    );
  });
}


async function logCommand(guildId, userId, commandName, args) {
  const timestamp = Math.floor(Date.now() / 1000);
  const argsString = args ? JSON.stringify(args) : '';
  
  return new Promise((resolve, reject) => {
    modDB.run(
      'INSERT INTO command_logs (guild_id, user_id, command_name, arguments, timestamp) VALUES (?, ?, ?, ?, ?)',
      [guildId, userId, commandName, argsString, timestamp],
      function(err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
}


async function getCommandLogs(guildId, limit = 50) {
  return new Promise((resolve, reject) => {
    modDB.all(
      'SELECT * FROM command_logs WHERE guild_id = ? ORDER BY timestamp DESC LIMIT ?',
      [guildId, limit],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}


async function hasCommandPermission(guildId, userId, commandName, memberRoles) {
  const permittedRoles = await getCommandPermissions(guildId, commandName);
  
  if (permittedRoles.length === 0) return true;
  
  return memberRoles.some(role => permittedRoles.includes(role));
}

module.exports = {
  setupModDatabase,
  addCommandPermission,
  removeCommandPermission,
  getCommandPermissions,
  logCommand,
  getCommandLogs,
  hasCommandPermission
};