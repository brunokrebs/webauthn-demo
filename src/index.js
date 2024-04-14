const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// parse cookies
app.use(cookieParser());

app.set('view engine', 'pug');

const users = {
  'bruno@mimic.com': {
    email: 'bruno@mimic.com',
    password: '12--3!4#5@6',
    name: 'Bruno',
  },
  'johns@mimic.com': {
    email: 'johns@mimic.com',
    password: '12--3!4#5@6',
    name: 'John',
  },
};

const sessions = {};

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/login', (req, res) => {
  console.log('====== - req.body:', req.body);
  const email = req.body.email;
  const password = req.body.password;

  if (users[email] && users[email].password === password) {
    const sessionId = Math.random().toString(36).substring(7);
    sessions[sessionId] = email;
    res.cookie('sessionId', sessionId);
    res.redirect('/dashboard');
    return;
  }

  res.redirect('/?error=login-failed');
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
  console.log('====== - user:', user);
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
});

// Start the server
app.listen(port, () => {;
  console.log(`Server is running: http://localhost:${port}`);
});
