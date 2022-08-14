const { db, admin, firebase } = require('../firebaseConfig');
const firestore = db;
const Admin = require('../models/adminModel');

const checkAdmin = async (req, res, next) => {
    // console.log(req.body);

    await admin
        .auth()
        .getUser(req.params.userId)
        .then((userRecord) => {
            // The claims can be accessed on the user record.
            res.status(200).json({ claims: userRecord.customClaims });
            // res.status(200).json({ admin: userRecord.customClaims['admin'] });
        })
        .catch((error) => {
            console.log(error);
            res.status(404).json({
                error,
            });
        });
};

const adminCreateAdmin = async (req, res) => {
    await admin
        .auth()
        .createUser({
            email: req.body.email,
            emailVerified: true,
            password: req.body.password,
            disabled: false,
        })
        .then(async (userRecord) => {
            //   req.body.id = userRecord.uid;
            req.body.dateJoined = firebase.firestore.Timestamp.fromDate(
                new Date()
            );
            const { superAdmin, password, email, ...data } = req.body;
            await admin
                .auth()
                .setCustomUserClaims(userRecord.uid, {
                    admin: superAdmin ? 'superAdmin' : 'admin',
                })
                .catch((err) => {
                    throw new Error(err);
                });
            // See the UserRecord reference doc for the contents of userRecord.
            console.log('Successfully created new admin:', userRecord.uid);
            if (!superAdmin) {
                firestore
                    .collection('counter')
                    .doc('admin')
                    .update({
                        count: firebase.firestore.FieldValue.increment(1),
                    });
                firestore.collection('admin').doc(userRecord.uid).set(data);
            }
            res.json({ success: true });
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

const getAllAdmins = async (req, res) => {
    /*example query from admin interface
     * filter: '{}'
     * range: '[0,4]' - first 5, '[5,9]' - next 5
     ** can set the range as anything (retrieve in batches of 5, or 10, 15, etc)
     * sort: '["dateJoined", "ASC"]' OR '["dateJoined", "DESC"]'
     */

    try {
        // console.log(req.query);
        let sortBy = [];
        let filterBy = [];
        let range = [];
        let key = '';
        let data = {};
        let limit = 0;

        const adminList = [];

        if (req.query.filter) {
            filterBy = JSON.parse(req.query.filter);
            key = Object.keys(JSON.parse(req.query.filter))[0];
        }

        if (req.query.range) {
            range = JSON.parse(req.query.range);
            limit = range[1] + 1;
        }

        if (req.query.sort) {
            sortBy = JSON.parse(req.query.sort);
            sortBy[1] = sortBy[1].toLowerCase();
        }

        const admins = firestore.collection('admin');

        if (req.query.filter !== '{}') {
            //searchbar OR filter button on admins interface
            data = await admins.where(key, '==', filterBy[key]).get();
        } else if (req.query.sort) {
            //pagination - table view on admins interface (less efficient due to firebase's limitations) &&
            //range provided increases e.g. 5 records per page -> [0,4] -> [5,9]
            data = await admins
                // .where('role', '==', 'writer')
                .orderBy(sortBy[0], sortBy[1])
                .limit(limit)
                .get();
        } else {
            //for mobile app before implementing infinite scroll
            data = await admins.get();
        }

        if (data.empty) {
            res.set('Content-Range', 0);
            res.status(200).send(adminList);
        } else {
            data.forEach((adminDetail) => {
                const adminUser = new Admin(
                    adminDetail.id,
                    adminDetail.data().username,
                    adminDetail.data().dateJoined.toDate().toLocaleString()
                );

                adminList.push(adminUser);
            });

            // TODO: need to get total number of documents in collection from firestore... but how??
            const count = await db.collection('counter').doc('admin').get();
            res.set('Content-Range', count.data().count);
            res.send(adminList.splice(range[0], range[1] + 1)); //retrieve records per page
        }
    } catch (error) {
        res.set('Content-Range', 0);
        res.status(400).send(error.message);
    }
};

const getAdmin = async (req, res) => {
    try {
        const userId = req.params.userId;
        const adminUser = await firestore.collection('admin').doc(userId).get();
        if (!adminUser.exists) {
            res.status(404).send('Admin with this Id not found');
        } else {
            const adminDetails = new Admin(
                adminUser.id,
                adminUser.data().username,
                adminUser.data().dateJoined.toDate().toLocaleString()
            );
            res.send(adminDetails);
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
};

const deleteAdmin = async (req, res) => {
    try {
        const userId = req.params.userId;
        // console.log(userId);
        await admin
            .auth()
            .deleteUser(userId)
            .catch((err) => {
                throw new Error(err);
            });
        await firestore.collection('admin').doc(userId).delete();

        firestore
            .collection('counter')
            .doc('admin')
            .update({ count: firebase.firestore.FieldValue.increment(-1) });

        res.status(200).send('Deleted ' + userId + ' successfully');
    } catch (error) {
        return res.status(400).send(error);
    }
};

const updateAdmin = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { id, dateJoined, password, email, ...updatedData } = req.body;
        await admin.auth().updateUser(id, {
            email,
            password,
        });

        await firestore.collection('admin').doc(userId).update(updatedData);
        res.status(200).json(req.body);
    } catch (error) {
        return res.status(400).send(error);
    }
};

const createSuperAdmin = async (req, res, next) => {
    //   console.log(req.body);
    await admin
        .auth()
        .setCustomUserClaims(req.body.uid, { admin: 'superAdmin' })
        .then(() => {
            res.status(200).json({ status: 'success' });
            // The new custom claims will propagate to the user's ID token the
            // next time a new one is issued.
        })
        .catch((error) =>
            res.status(404).json({
                error,
            })
        );
};

module.exports = {
    checkAdmin,
    adminCreateAdmin,
    getAllAdmins,
    getAdmin,
    deleteAdmin,
    updateAdmin,
    createSuperAdmin,
};
