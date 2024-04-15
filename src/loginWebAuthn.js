const fs = require('fs');
const { verifyAuthenticationResponse } = require('@simplewebauthn/server');
const users = require('../database/users.json');
const sessions = require('../database/sessions.json');

module.exports = {
  loginWebAuthn: async (req, res) => {
    const data = req.body;
    const usersEmails = Object.keys(users);
    const user = users[usersEmails.find((email) => users[email].credential.credentialID === data.id)];
    if (!user) {
      return res.status(403).end();
    }
    if (!user.credential) {
      return res.status(403).end();
    }
    try {
      const credentialPublicKey = Uint8Array.from(Object.values(user.credential.credentialPublicKey));
      const verificationRes = await verifyAuthenticationResponse({
        response: data,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: 'https://92aa-2804-14d-4c87-92a6-ac3b-ce8c-fab1-992d.ngrok-free.app',
        expectedRPID: '92aa-2804-14d-4c87-92a6-ac3b-ce8c-fab1-992d.ngrok-free.app',
        authenticator: {
          credentialPublicKey,
        },
      });

      const sessionId = Math.random().toString(36).substring(7);
      sessions[sessionId] = user.email;      
      res.cookie('sessionId', sessionId);
      fs.writeFile('./database/sessions.json', JSON.stringify(sessions, null, 2), (err) => {
        if (err) {
          console.error('Error updating sessions.json:', err);
          res.redirect('/?error=login-failed');
          return;
        }
        res.cookie('sessionId', sessionId);
        res.send({
          verified: verificationRes.verified,
          user: {
            email: user.email,
            id: user.id,
          },
        });
      });
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  },
}