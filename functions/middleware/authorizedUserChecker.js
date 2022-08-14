const admin = require('firebase-admin');

const enforceAuthorizedUser = (req, res, next) => {
    if (
        req.headers.token === null ||
        req.headers.token === 'null' ||
        req.headers.token === 'not signed in'
    ) {
        return res.status(403).send('No credentials sent!');
    }
    const firebaseGeneratedToken = req.headers.token;

    admin
        .auth()
        .verifyIdToken(firebaseGeneratedToken)
        .then((decodedToken) => {
            const uid = decodedToken.uid;
            next();
        })
        .catch((error) => {
            return res.status(400).send('Error verifying token: ' + error);
        });
};

module.exports = enforceAuthorizedUser;
