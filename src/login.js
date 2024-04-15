module.exports = {
  login: (req, res) => {
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
  }
}
