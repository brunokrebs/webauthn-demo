const fs = require('fs');
const sessions = require('../database/sessions.json');

module.exports = {
  logout: (req, res) => {
    const sessionId = req.cookies?.sessionId;
    delete sessions[sessionId];
    res.clearCookie('sessionId');
    res.redirect('/');
    fs.writeFile('./database/sessions.json', JSON.stringify(sessions, null, 2), (err) => {
      if (err) {
        console.error('Error updating sessions.json:', err);
      }
    });
  }
}
