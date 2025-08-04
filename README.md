# CRM Immobiliare - Gestione Contatti Chiamate

Un sistema CRM per la gestione dei contatti telefonici per agenzie immobiliari. Permette di registrare e gestire le chiamate dei potenziali clienti. I dati vengono salvati su Google Sheets.

## Funzionalità

- Sistema di autenticazione con login
- Registrazione dei contatti telefonici con tutti i dettagli richiesti
- Archiviazione dei contatti in Google Sheets
- Visualizzazione della lista dei contatti
- Filtri di ricerca per nome, cognome, numero di telefono, tipo di ricerca e data
- Visualizzazione dettagli completi di ogni contatto

## Requisiti di Sistema

- Node.js (v14 o superiore)
- NPM (v6 o superiore)
- Un account Google

## Configurazione di Google Sheets

Per utilizzare Google Sheets come database, segui questi passaggi:

1. Vai alla [Console Google Cloud](https://console.cloud.google.com/)
2. Crea un nuovo progetto
3. Abilita l'API Google Sheets
4. Crea un account di servizio
5. Genera una chiave JSON per l'account di servizio
6. Crea un nuovo foglio Google Sheets
7. Condividi il foglio con l'email dell'account di servizio (con permessi di modifica)
8. Copia l'ID del foglio (dalla URL: `https://docs.google.com/spreadsheets/d/ID_DEL_FOGLIO/edit`)
9. Modifica il file `config.js` con le credenziali dell'account di servizio e l'ID del foglio

## Installazione

1. Clona o scarica il repository
2. Apri il terminale nella cartella del progetto
3. Installa le dipendenze:

```
npm install
```

4. Configura le credenziali Google Sheets nel file `config.js`

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

## Deploy su Vercel

Questa applicazione è configurata per essere facilmente deployata su Vercel:

1. Crea un account su [Vercel](https://vercel.com) se non ne hai già uno
2. Installa la CLI di Vercel:
   ```
   npm i -g vercel
   ```
3. Esegui il login da terminale:
   ```
   vercel login
   ```
4. Configura le variabili d'ambiente su Vercel con le credenziali di Google Sheets
5. Dalla directory del progetto, esegui:
   ```
   vercel
   ```
6. Segui le istruzioni a schermo per completare il deploy

Alternativamente, puoi collegare il tuo repository GitHub direttamente a Vercel:
1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Clicca su "New Project"
3. Importa il tuo repository GitHub
4. Configura le variabili d'ambiente
5. Configura il progetto e clicca su "Deploy"

## Struttura del Progetto

```
contatti-chiamate/
├── app.js                  # File principale dell'applicazione
├── package.json            # Configurazione NPM
├── config.js               # Configurazione dell'applicazione e Google Sheets
├── vercel.json             # Configurazione per Vercel
├── public/                 # File statici
│   ├── css/                # Fogli di stile
│   │   └── style.css       # Stili personalizzati
│   └── js/                 # JavaScript client
│       ├── main.js         # Script principale
│       └── contacts.js     # Script per la gestione dei contatti
├── models/                 # Modelli di dati
│   ├── User.js             # Modello per gli utenti
│   └── GoogleSheetsService.js # Servizio per interagire con Google Sheets
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
4. Clicca su "Salva Contatto" per salvare i dati su Google Sheets
5. Visualizza la lista dei contatti nella pagina "Lista Contatti"
6. Utilizza i filtri per cercare contatti specifici
7. Clicca sull'icona dell'occhio per visualizzare i dettagli completi di un contatto

## Tecnologie Utilizzate

- Node.js con Express
- Google Sheets API per il database
- EJS come motore di template
- Bootstrap 5 per l'interfaccia utente
- JavaScript per le funzionalità client-side
- Express-session per la gestione delle sessioni
- Bcryptjs per la crittografia delle password 