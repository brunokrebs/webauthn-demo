const express = require('express');
const fs = require('fs');
const cookieParser = require('cookie-parser');

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// parse cookies
app.use(cookieParser());

app.set('view engine', 'pug');

const users = require('../database/users.json');
const sessions = require('../database/sessions.json');

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (users[email] && users[email].password === password) {
    const sessionId = Math.random().toString(36).substring(7);
    sessions[sessionId] = email;
    
    fs.writeFile('./database/sessions.json', JSON.stringify(sessions, null, 2), (err) => {
      if (err) {
        console.error('Error updating sessions.json:', err);
        res.redirect('/?error=login-failed');
        return;
      }
      res.cookie('sessionId', sessionId);
      res.json({ message: 'Success' });
    });
  }
});

app.post('/webauthn/start', (req, res) => {
  const email = req.body.email;
  const user = users[email];
  const challenge = 'VMUn8NmCuSOHhSSvvOCVhlv5OoRnmi7S2O2sKsPTNzE=';
  user.webauthnChallenge = challenge;

  fs.writeFile('./database/users.json', JSON.stringify(users, null, 2), (err) => {
    if (err) {
      console.error('Error updating users.json:', err);
      res.json({ message: 'Failed' });
      return;
    }
    res.json({ message: 'Success', challenge, credentialId: user.credential?.id });
  });
});

app.post('/register-credential', (req, res) => {
  const credentials = req.body;
  const email = sessions[req.cookies.sessionId];
  const user = users[email];
  user.credential = credentials;

  fs.writeFile('./database/users.json', JSON.stringify(users, null, 2), (err) => {
    if (err) {
      console.error('Error updating users.json:', err);
      res.json({ message: 'Failed' });
      return;
    }
    res.json({ message: 'Success' });
  });
});

const authenticatedMiddleware = (req, res, next) => {
  const sessionId = req.cookies?.sessionId;
  if (sessions[sessionId]) {
    next();
    return;
  }

  if (sessionId && !sessions[sessionId]) {
    res.clearCookie('sessionId');
  }

  res.redirect('/?error=not-authenticated');
}

app.get('/dashboard', authenticatedMiddleware, (req, res) => {
  const email = sessions[req.cookies.sessionId];
  const user = users[email];
  res.render('dashboard', { user });
});

app.post('/api/data', (req, res) => {
  const requestData = req.body;
  const responseData = { message: 'Success' };
  res.json(responseData);
});

app.get('/logout', (req, res) => {
  const sessionId = req.cookies?.sessionId;
  delete sessions[sessionId];
  res.clearCookie('sessionId');
  res.redirect('/');
  fs.writeFile('./database/sessions.json', JSON.stringify(sessions, null, 2), (err) => {
    if (err) {
      console.error('Error updating sessions.json:', err);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running: http://localhost:${port}`);
});
