const users = require('../database/users.json');
const sessions = require('../database/sessions.json');

module.exports = {
  dashboard: (req, res) => {
    const email = sessions[req.cookies.sessionId];
    const user = users[email];
    res.render('dashboard', { user });
  }
}
