const bcrypt = require('bcryptjs');
const config = require('../config');

// Utente predefinito
const defaultUser = {
  id: 1,
  username: config.app.defaultUser.username,
  password: bcrypt.hashSync(config.app.defaultUser.password, 10),
  created_at: new Date().toISOString()
};

// Funzioni per la gestione degli utenti
const User = {
  // Trova un utente per username
  findByUsername: (username) => {
    return new Promise((resolve, reject) => {
      if (username.toLowerCase() === defaultUser.username.toLowerCase()) {
        resolve(defaultUser);
      } else {
        resolve(null);
      }
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