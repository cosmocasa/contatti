const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const url = require('url');
const express = require('./app');
const portfinder = require('portfinder');

// Porta predefinita
const DEFAULT_PORT = 3000;

// Variabile per la finestra principale
let mainWindow;
let expressApp;
let serverPort;

// Funzione per creare la finestra dell'applicazione
async function createWindow() {
  // Trova una porta disponibile
  try {
    serverPort = await portfinder.getPortPromise({ port: DEFAULT_PORT });
  } catch (err) {
    console.error('Errore nel trovare una porta disponibile:', err);
    serverPort = DEFAULT_PORT;
  }

  // Avvia il server Express
  expressApp = express.listen(serverPort, () => {
    console.log(`Server Express avviato sulla porta ${serverPort}`);
  });

  // Crea la finestra principale
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'public', 'favicon.ico'),
    title: 'CRM Immobiliare'
  });

  // Carica l'applicazione Express
  mainWindow.loadURL(`http://localhost:${serverPort}/login`);

  // Apre il DevTools in modalità di sviluppo
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Gestione della chiusura della finestra
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (expressApp) {
      expressApp.close();
    }
  });

  // Crea il menu dell'applicazione
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Esci',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click() { app.quit(); }
        }
      ]
    },
    {
      label: 'Visualizza',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Navigazione',
      submenu: [
        {
          label: 'Home',
          click() { mainWindow.loadURL(`http://localhost:${serverPort}/`); }
        },
        {
          label: 'Nuovo Contatto',
          click() { mainWindow.loadURL(`http://localhost:${serverPort}/nuovo-contatto`); }
        },
        {
          label: 'Lista Contatti',
          click() { mainWindow.loadURL(`http://localhost:${serverPort}/contatti`); }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Quando l'app è pronta, crea la finestra
app.on('ready', createWindow);

// Gestione della chiusura dell'app su macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Gestione dell'attivazione dell'app su macOS
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Gestione della chiusura dell'app
app.on('before-quit', () => {
  if (expressApp) {
    expressApp.close();
  }
}); 