# CRM Immobiliare - Gestione Contatti Chiamate

Un sistema CRM per la gestione dei contatti telefonici per agenzie immobiliari. Permette di registrare e gestire le chiamate dei potenziali clienti.

## Funzionalità

- Sistema di autenticazione con login
- Registrazione dei contatti telefonici con tutti i dettagli richiesti
- Archiviazione dei contatti in un database SQLite
- Visualizzazione della lista dei contatti
- Filtri di ricerca per nome, cognome, numero di telefono, tipo di ricerca e data
- Visualizzazione dettagli completi di ogni contatto

## Requisiti di Sistema

- Node.js (v14 o superiore)
- NPM (v6 o superiore)

## Installazione

1. Clona o scarica il repository
2. Apri il terminale nella cartella del progetto
3. Installa le dipendenze:

```
npm install
```

## Avvio dell'Applicazione

Per avviare l'applicazione in modalità sviluppo:

```
npm run dev
```

Per avviare l'applicazione in modalità produzione:

```
npm start
```

L'applicazione sarà disponibile all'indirizzo `http://localhost:3000`

## Accesso al Sistema

Per accedere al sistema, utilizza le seguenti credenziali:

- Username: `Cosmocontatti`
- Password: `XcosmoContatti299!`

## Struttura del Progetto

```
contatti-chiamate/
├── app.js                  # File principale dell'applicazione
├── package.json            # Configurazione NPM
├── database.db             # Database SQLite
├── public/                 # File statici
│   ├── css/                # Fogli di stile
│   │   └── style.css       # Stili personalizzati
│   └── js/                 # JavaScript client
│       ├── main.js         # Script principale
│       └── contacts.js     # Script per la gestione dei contatti
├── models/                 # Modelli di dati
│   └── User.js             # Modello per gli utenti
├── routes/                 # Rotte dell'applicazione
│   └── auth.js             # Rotte per l'autenticazione
└── views/                  # Template EJS
    ├── index.ejs           # Pagina principale
    ├── form.ejs            # Form per l'inserimento dei contatti
    ├── contatti.ejs        # Lista dei contatti
    └── login.ejs           # Pagina di login
```

## Utilizzo

1. Accedi al sistema con le credenziali fornite
2. Dalla pagina principale, clicca su "Registra Nuovo Contatto" per inserire un nuovo contatto
3. Compila il form con i dati richiesti
4. Clicca su "Salva Contatto" per salvare i dati
5. Visualizza la lista dei contatti nella pagina "Lista Contatti"
6. Utilizza i filtri per cercare contatti specifici
7. Clicca sull'icona dell'occhio per visualizzare i dettagli completi di un contatto

## Tecnologie Utilizzate

- Node.js con Express
- SQLite per il database
- EJS come motore di template
- Bootstrap 5 per l'interfaccia utente
- JavaScript per le funzionalità client-side
- Express-session per la gestione delle sessioni
- Bcryptjs per la crittografia delle password 