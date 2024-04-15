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
      rpName: '92aa-2804-14d-4c87-92a6-ac3b-ce8c-fab1-992d.ngrok-free.app',
      rpID: '92aa-2804-14d-4c87-92a6-ac3b-ce8c-fab1-992d.ngrok-free.app',
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
