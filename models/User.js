const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Determina il percorso del database in base all'ambiente
const dbPath = process.env.NODE_ENV === 'production' 
  ? path.join('/tmp', 'database.db')  // Usa /tmp per Render
  : './database.db';

const db = new sqlite3.Database(dbPath);

// Creazione della tabella utenti se non esiste
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) {
    console.error('Errore nella creazione della tabella utenti:', err.message);
  } else {
    console.log('Tabella utenti creata o già esistente');
    
    // Controllo se esiste già l'utente predefinito
    db.get('SELECT * FROM users WHERE username = ?', ['Cosmocontatti'], (err, row) => {
      if (err) {
        console.error('Errore durante la verifica dell\'utente:', err.message);
      } else if (!row) {
        // Creazione dell'utente predefinito se non esiste
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync('XcosmoContatti299!', salt);
        
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
          ['Cosmocontatti', hashedPassword], 
          function(err) {
            if (err) {
              console.error('Errore durante la creazione dell\'utente predefinito:', err.message);
            } else {
              console.log('Utente predefinito creato con successo');
            }
          }
        );
      }
    });
  }
});

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