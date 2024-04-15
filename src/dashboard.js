const users = require('../database/users.json');

module.exports = {
  dashboard: (req, res) => {
    const email = sessions[req.cookies.sessionId];
    const user = users[email];
    res.render('dashboard', { user });
  }
}
