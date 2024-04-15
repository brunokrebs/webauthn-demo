const { sessions } = require('../database/sessions');

module.exports = {
  authenticatedMiddleware: (req, res, next) => {
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
}