const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');


const dbDir = path.join(__dirname, '..', '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(path.join(dbDir, 'warns.db'));


db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS warns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason TEXT,
    timestamp INTEGER NOT NULL
  )`);
});


async function addWarn(guildId, userId, moderatorId, reason) {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    db.run(
      'INSERT INTO warns (guild_id, user_id, moderator_id, reason, timestamp) VALUES (?, ?, ?, ?, ?)',
      [guildId, userId, moderatorId, reason, timestamp],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      }
    );
  });
}


async function getWarns(guildId, userId) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM warns WHERE guild_id = ? AND user_id = ? ORDER BY timestamp DESC',
      [guildId, userId],
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      }
    );
  });
}


async function deleteWarn(warnId) {
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM warns WHERE id = ?',
      [warnId],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      }
    );
  });
}


async function clearWarns(guildId, userId) {
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM warns WHERE guild_id = ? AND user_id = ?',
      [guildId, userId],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes);
      }
    );
  });
}


async function getWarnById(warnId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM warns WHERE id = ?',
      [warnId],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      }
    );
  });
}

module.exports = {
  addWarn,
  getWarns,
  deleteWarn,
  clearWarns,
  getWarnById
};