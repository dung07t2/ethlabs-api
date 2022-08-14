const { db, admin } = require('../firebaseConfig');

const login = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const doc = await db.collection('user').doc(userId).get();
        const isFirstLogin = !doc.exists;

        res.status(200).json({
            status: 'success',
            uid: userId,
            isFirstLogin,
            role: isFirstLogin ? '' : doc.data().role,
            username: isFirstLogin ? '' : doc.data().username,
            profilePicture: isFirstLogin ? '' : doc.data().profilePicture,
        });
    } catch (error) {
        console.log(error.message);
        res.status(404).json({
            error,
        });
    }
};

const checkPhoneExists = async (req, res, next) => {
    await admin
        .auth()
        .getUserByPhoneNumber(req.body.phoneNumber)
        .then((userRecord) => {
            // User exists.
            res.status(200).json({
                status: 'success',
            });
        })
        .catch((error) => {
            if (error.code === 'auth/user-not-found') {
                // User not found.
                res.status(404).json({
                    error,
                });
            }
        });
};

const checkAccountId = async (req, res) => {
    // console.log('reached');
    const response = { email: null, phoneNumber: null, provider: null };
    await admin
        .auth()
        .getUser(req.params.userId)
        .then((user) => {
            response.email = user.email;
            response.phoneNumber = user.phoneNumber;
            response.provider = user.providerData[0].providerId;
            res.status(200).send(response);
        })
        .catch((error) => {
            res.status(404).json({
                error,
            });
        });
};

module.exports = {
    login,
    checkPhoneExists,
    checkAccountId,
};
