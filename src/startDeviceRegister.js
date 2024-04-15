const fs = require('fs');
const crypto = require('crypto');
const base64url = require('base64url');
const users = require('../database/users.json');
const { generateRegistrationOptions } = require('@simplewebauthn/server');
const { isoUint8Array } = require('@simplewebauthn/server/helpers');

module.exports = {
  startDeviceRegister: async (req, res) => {
    const user = users[req.body.email];
    const challenge = base64url(crypto.randomBytes(20));
    const options = await generateRegistrationOptions({
      rpName: 'clever-stag-together.ngrok-free.app',
      rpID: 'clever-stag-together.ngrok-free.app',
      userID: isoUint8Array.fromUTF8String(user.id),
      userName: user.email,
      challenge,
      excludeCredentials: !user.credential
        ? []
        : [{
          id: base64url(user.credential.id),
          type: 'public-key',
        }],
      timeout: 1000 * 60 * 2,
      attestationType: 'none',
    });
    user.currentChallenge = options.challenge;
    fs.writeFile('./database/users.json', JSON.stringify(users, null, 2), (err) => {
      if (err) {
        console.error('Error updating users.json:', err);
        res.json({ message: 'Failed' });
        return;
      }
      res.json(options);
    });
  }
}
