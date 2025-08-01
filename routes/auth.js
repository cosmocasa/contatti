const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware per verificare se l'utente è autenticato
const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    return next();
  }
  
  // Salva l'URL originale per reindirizzare dopo il login
  req.session.returnTo = req.originalUrl;
  req.flash('error', 'Devi effettuare l\'accesso per visualizzare questa pagina');
  res.redirect('/login');
};

// Pagina di login
router.get('/login', (req, res) => {
  // Se l'utente è già autenticato, reindirizza alla home
  if (req.session.isAuthenticated) {
    return res.redirect('/');
  }
  
  res.render('login', {
    messages: req.flash()
  });
});

// Gestione del login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.authenticate(username, password);
    
    if (!user) {
      req.flash('error', 'Username o password non validi');
      return res.redirect('/login');
    }
    
    // Imposta la sessione come autenticata
    req.session.isAuthenticated = true;
    req.session.user = {
      id: user.id,
      username: user.username
    };
    
    // Reindirizza alla pagina originale o alla home
    const returnTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    
    res.redirect(returnTo);
  } catch (err) {
    console.error('Errore durante il login:', err);
    req.flash('error', 'Si è verificato un errore durante il login');
    res.redirect('/login');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Errore durante il logout:', err);
    }
    res.redirect('/login');
  });
});

module.exports = {
  router,
  isAuthenticated
}; 