# Istruzioni per caricare il progetto su GitHub

Segui questi passaggi per caricare il progetto sulla repository GitHub che hai già creato:

## 1. Inizializza il repository Git locale

```bash
git init
```

## 2. Aggiungi i file al repository

```bash
git add .
```

## 3. Crea il primo commit

```bash
git commit -m "Prima versione del CRM Immobiliare"
```

## 4. Imposta la branch principale come 'main'

```bash
git branch -M main
```

## 5. Collega il repository locale a quello remoto

Sostituisci `cosmocasa` con il tuo nome utente GitHub se diverso:

```bash
git remote add origin https://github.com/cosmocasa/contatti.git
```

## 6. Carica i file su GitHub

```bash
git push -u origin main
```

## Note importanti

1. Assicurati di avere Git installato sul tuo computer
2. Se richiesto, inserisci le tue credenziali GitHub
3. Il file `.gitignore` è già configurato per escludere i file non necessari (come `node_modules` e il database)
4. Se desideri includere il database vuoto (senza dati), rimuovi la riga `*.db` dal file `.gitignore`

## Dopo il caricamento

Una volta completato il caricamento, potrai accedere al tuo repository all'indirizzo:
https://github.com/cosmocasa/contatti

Da qui potrai:
- Gestire il codice
- Creare nuove branch
- Gestire le issue
- Configurare GitHub Pages (se desideri una demo online)
- Collaborare con altri sviluppatori 