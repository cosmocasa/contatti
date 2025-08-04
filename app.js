const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

// Importo le configurazioni
const config = require('./config');

// Importo il servizio Google Sheets
const GoogleSheetsService = require('./models/GoogleSheetsService');
const sheetsService = new GoogleSheetsService(
  config.google.credentials,
  config.google.spreadsheetId
);

// Inizializzo il foglio di Google Sheets
sheetsService.initializeSheet().catch(err => {
  console.error('Errore durante l\'inizializzazione del foglio Google Sheets:', err);
});

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
  secret: config.app.sessionSecret,
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
app.post('/salva-contatto', isAuthenticated, async (req, res) => {
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

  try {
    const newId = await sheetsService.addContact({
      nome,
      cognome,
      motivo_chiamata,
      riferimento_immobile,
      numero_telefono,
      email,
      note,
      data_chiamata,
      tipo_ricerca
    });
    
    console.log(`Contatto salvato con ID: ${newId}`);
    res.redirect('/contatti');
  } catch (err) {
    console.error('Errore durante il salvataggio del contatto:', err);
    return res.status(500).send('Errore durante il salvataggio del contatto');
  }
});

// Rotta per visualizzare tutti i contatti con filtri
app.get('/contatti', isAuthenticated, async (req, res) => {
  const { search, tipo, date } = req.query;
  
  try {
    const contatti = await sheetsService.getContacts({ search, tipo, date });
    
    res.render('contatti', { 
      contatti,
      filters: { search, tipo, date }
    });
  } catch (err) {
    console.error('Errore durante il recupero dei contatti:', err);
    return res.status(500).send('Errore durante il recupero dei contatti');
  }
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
app.get('/api/contatti/:id', isAuthenticated, async (req, res) => {
  const id = req.params.id;
  
  try {
    const contatto = await sheetsService.getContactById(id);
    
    if (!contatto) {
      return res.status(404).json({ error: 'Contatto non trovato' });
    }
    
    res.json(contatto);
  } catch (err) {
    console.error('Errore durante il recupero del contatto:', err);
    return res.status(500).json({ error: 'Errore durante il recupero del contatto' });
  }
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});

// Esporta l'app per Vercel
module.exports = app; 