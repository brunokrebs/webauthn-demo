const { generateAuthenticationOptions } = require("@simplewebauthn/server");
const users = require("../database/users.json");
const fs = require('fs');

module.exports = {
  loginOptions: async (req, res) => {
    const email = req.body.email;
    const user = users[email];
    const options = await generateAuthenticationOptions({
      allowCredentials: [{
        id: user.credential.credentialID,
        type: "public-key",
      }],
      userVerification: "preferred",
      timeout: 60 * 1000 * 5, 
    });
    user.currentChallenge = options.challenge;
    fs.writeFile('./database/users.json', JSON.stringify(users, null, 2), (err) => {
      if (err) {
        console.error('Error updating users.json:', err);
        res.json({ message: 'Failed' });
        return;
      }
      res.send({ data: options });
    });
  },
}