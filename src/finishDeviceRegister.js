const fs = require('fs');
const users = require('../database/users.json');
const { verifyRegistrationResponse } = require('@simplewebauthn/server');

module.exports = {
  finishDeviceRegister: async (req, res) => {
    const { data, email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "invalid email" });
    }
    const user = users[email];
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    try {
      const verificationResult = await verifyRegistrationResponse({
        response: data,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: 'https://clever-stag-together.ngrok-free.app',
        expectedRPID: 'clever-stag-together.ngrok-free.app',
      });
      if (!verificationResult.verified) {
        return res.status(403).end();
      }
      if (verificationResult?.registrationInfo) {
        const { credentialPublicKey, credentialID, counter } = verificationResult.registrationInfo;
        const newAuthenticator = {
          credentialPublicKey,
          credentialID,
          counter,
        };
        user.credential = newAuthenticator;
        user.currentChallenge = null;
        fs.writeFile('./database/users.json', JSON.stringify(users, null, 2), (err) => {
          if (err) {
            console.error('Error updating users.json:', err);
            res.json({ message: 'Failed' });
            return;
          }
        });
      }
      res.status(200).json({ message: "verified" });
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  },
}
