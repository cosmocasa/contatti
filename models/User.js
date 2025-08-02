const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Determina il percorso del database in base all'ambiente
const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel 
  ? ':memory:'
  : process.env.NODE_ENV === 'production' 
    ? path.join('/tmp', 'database.db')
    : './database.db';

const db = new sqlite3.Database(dbPath);

// Funzioni per la gestione degli utenti
const User = {
  // Trova un utente per username
  findByUsername: (username) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },
  
  // Verifica le credenziali di un utente
  authenticate: async (username, password) => {
    try {
      const user = await User.findByUsername(username);
      if (!user) {
        return false;
      }
      
      const isMatch = bcrypt.compareSync(password, user.password);
      return isMatch ? user : false;
    } catch (err) {
      console.error('Errore durante l\'autenticazione:', err.message);
      return false;
    }
  }
};

module.exports = User; 