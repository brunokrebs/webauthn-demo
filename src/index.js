const express = require('express');
const cookieParser = require('cookie-parser');
const { login } = require('./login');
const { startDeviceRegister } = require('./startDeviceRegister');
const { finishDeviceRegister } = require('./finishDeviceRegister');
const { authenticatedMiddleware } = require('./authenticatedMiddleware');
const { dashboard } = require('./dashboard');
const { logout } = require('./logout');

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'pug');

app.get('/', (_, res) => res.render('index'));
app.post('/login', login);
app.post('/webauthn/start', startDeviceRegister);
app.post('/webauthn/finish', finishDeviceRegister);
app.get('/dashboard', authenticatedMiddleware, dashboard);
app.get('/logout', logout);

// Start the server
app.listen(port, () => console.log(`Server is running: http://localhost:${port}`));
