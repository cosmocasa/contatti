const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');

// Importo le rotte di autenticazione
const { router: authRoutes, isAuthenticated } = require('./routes/auth');

// Inizializzazione dell'app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configurazione per proxy
app.set('trust proxy', 1);

// Configurazione del motore di template EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configurazione della sessione
app.use(session({
  secret: 'cosmocontatti_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Impostiamo su false anche in produzione per evitare problemi
    maxAge: 24 * 60 * 60 * 1000 // 24 ore
  }
}));

// Configurazione di flash per i messaggi
app.use(flash());

// Middleware per rendere disponibili le informazioni dell'utente nei template
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = req.session.isAuthenticated || false;
  next();
});

// Determina il percorso del database in base all'ambiente
// Per Vercel, usiamo :memory: per un database in memoria
const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel 
  ? ':memory:'
  : process.env.NODE_ENV === 'production' 
    ? path.join('/tmp', 'database.db')
    : './database.db';

// Inizializzazione del database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Errore nella connessione al database:', err.message);
  } else {
    console.log('Connessione al database SQLite stabilita');
    
    // Creazione della tabella contatti se non esiste
    db.run(`CREATE TABLE IF NOT EXISTS contatti (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cognome TEXT NOT NULL,
      motivo_chiamata TEXT NOT NULL,
      riferimento_immobile TEXT,
      numero_telefono TEXT NOT NULL,
      email TEXT,
      note TEXT,
      data_chiamata TEXT NOT NULL,
      tipo_ricerca TEXT NOT NULL
    )`, (err) => {
      if (err) {
        console.error('Errore nella creazione della tabella:', err.message);
      } else {
        console.log('Tabella contatti creata o già esistente');
      }
    });

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
            const bcrypt = require('bcryptjs');
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
  }
});

// Rotte di autenticazione
app.use('/', authRoutes);

// Rotte protette - richiedono autenticazione
app.get('/', isAuthenticated, (req, res) => {
  res.render('index');
});

// Rotta per visualizzare il form
app.get('/nuovo-contatto', isAuthenticated, (req, res) => {
  res.render('form');
});

// Rotta per salvare un nuovo contatto
app.post('/salva-contatto', isAuthenticated, (req, res) => {
  const {
    nome,
    cognome,
    motivo_chiamata,
    riferimento_immobile,
    numero_telefono,
    email,
    note,
    data_chiamata,
    tipo_ricerca
  } = req.body;

  const query = `INSERT INTO contatti 
    (nome, cognome, motivo_chiamata, riferimento_immobile, numero_telefono, email, note, data_chiamata, tipo_ricerca) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(query, 
    [nome, cognome, motivo_chiamata, riferimento_immobile, numero_telefono, email, note, data_chiamata, tipo_ricerca],
    function(err) {
      if (err) {
        console.error('Errore durante il salvataggio del contatto:', err.message);
        return res.status(500).send('Errore durante il salvataggio del contatto');
      }
      
      console.log(`Contatto salvato con ID: ${this.lastID}`);
      res.redirect('/contatti');
    }
  );
});

// Rotta per visualizzare tutti i contatti con filtri
app.get('/contatti', isAuthenticated, (req, res) => {
  const { search, tipo, date } = req.query;
  
  let query = 'SELECT * FROM contatti';
  let params = [];
  let conditions = [];
  
  if (search) {
    conditions.push('(nome LIKE ? OR cognome LIKE ? OR numero_telefono LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (tipo) {
    conditions.push('tipo_ricerca = ?');
    params.push(tipo);
  }
  
  if (date) {
    conditions.push('date(data_chiamata) >= date(?)');
    params.push(date);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY data_chiamata DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Errore durante il recupero dei contatti:', err.message);
      return res.status(500).send('Errore durante il recupero dei contatti');
    }
    
    res.render('contatti', { 
      contatti: rows,
      filters: { search, tipo, date }
    });
  });
});

// Aggiungi una rotta di debug per verificare lo stato della sessione
app.get('/debug-session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    isAuthenticated: req.session.isAuthenticated || false,
    user: req.session.user || null,
    cookies: req.cookies,
    sessionCookie: req.session.cookie
  });
});

// API per ottenere i dettagli di un contatto specifico
app.get('/api/contatti/:id', isAuthenticated, (req, res) => {
  const id = req.params.id;
  
  db.get('SELECT * FROM contatti WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Errore durante il recupero del contatto:', err.message);
      return res.status(500).json({ error: 'Errore durante il recupero del contatto' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Contatto non trovato' });
    }
    
    res.json(row);
  });
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});

// Gestione della chiusura del database alla chiusura dell'applicazione
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Errore durante la chiusura del database:', err.message);
    } else {
      console.log('Connessione al database chiusa');
    }
    process.exit(0);
  });
});

// Esporta l'app per Vercel
module.exports = app; 