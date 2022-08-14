/* eslint-disable no-unused-vars */
const functions = require('firebase-functions');
// const cloudinary = require("cloudinary");
const { db, admin, firebase } = require('../../firebaseConfig');

const firestore = db;
const Writer = require('../../models/writerModel');

const { optimiseImage } = require('../mediaController');

const addWriter = async (req, res, next) => {
    const batch = db.batch();
    req.body.dateJoined = firebase.firestore.Timestamp.fromDate(new Date());
    const data = req.body;

    const userRef = db.collection('user').doc(req.params.userId);
    batch.set(userRef, data);

    try {
        await batch.commit();
        res.status(200).send('Writer added successfully.');

        next();
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const adminCreateWriter = async (req, res, next) => {
    const data = req.body;
    await admin
        .auth()
        .createUser({
            email: data.email,
            emailVerified: true,
            password: data.password,
            disabled: false,
        })
        .then((userRecord) => {
            req.body.id = userRecord.uid;
            req.body.dateJoined = firebase.firestore.Timestamp.fromDate(
                new Date()
            );
            req.body.role = 'writer';
            req.body.isVerified = false;
            if (!req.body.profilePicture) {
                req.body.profilePicture =
                    // dummy profile pic if no profile picture is provided
                    'http://dreamvilla.life/wp-content/uploads/2017/07/dummy-profile-pic.png';
            }

            // See the UserRecord reference doc for the contents of userRecord.
            console.log('Successfully created new user:', userRecord.uid);
            next();
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

const adminAddWriter = async (req, res, next) => {
    const data = req.body;
    delete data.password;
    delete data.email;

    const batch = db.batch();
    const userRef = db.collection('user').doc(req.body.id);
    batch.set(userRef, data);

    try {
        await batch.commit();
        res.json({ success: true });

        next();
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const getAllWriter = async (req, res) => {
    /* example query from admin interface
     * filter: '{}'
     * range: '[0,4]' - first 5, '[5,9]' - next 5
     ** can set the range as anything (retrieve in batches of 5, or 10, 15, etc)
     * sort: '["dateJoined", "ASC"]' OR '["dateJoined", "DESC"]'
     */

    try {
        let sortBy = [];
        let filterBy = [];
        let range = [];
        let key = '';
        let data = {};
        let limit = 0;
        let latestDoc = '';
        const writerList = [];

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

        if (req.query.latest) {
            latestDoc = await firestore
                .collection('user')
                .doc(req.query.latest)
                .get();
        }

        const writers = firestore
            .collection('user')
            .where('role', '==', 'writer');

        if (req.query.filter !== '{}') {
            // searchbar OR filter button on admin interface
            data = await writers.where(key, '==', filterBy[key]).get();
        } else if (req.query.sort) {
            if (req.query.latest) {
                // pagination - infinite scroll on mobile app - 2nd batch onwards
                // range provided stays the same e.g. 5 records per page -> [0,4] throughout
                data = await writers
                    .orderBy('isVerified', 'desc') // This ensures that verified users appears first
                    .orderBy(sortBy[0], sortBy[1])
                    .startAfter(latestDoc) // Should be a docRef
                    .limit(limit)
                    .get();
            } else {
                // pagination - table view on admin interface (less efficient due to firebase's limitations) &&
                // range provided increases e.g. 5 records per page -> [0,4] -> [5,9]
                // pagination - infinite scroll on mobile app - 1st batch
                data = await writers
                    .orderBy('isVerified', 'desc') // This ensures that verified users appears first
                    .orderBy(sortBy[0], sortBy[1])
                    .limit(limit)
                    .get();
            }
        } else {
            // for mobile app before implementing infinite scroll
            data = await writers.where('role', '==', 'writer').get();
        }

        if (data.empty) {
            res.set('Content-Range', 0);
            res.status(200).send(writerList);
        } else {
            data.forEach((writerDetail) => {
                const writer = new Writer(
                    writerDetail.id,
                    writerDetail.data().role,
                    writerDetail.data().bio,
                    writerDetail.data().username,
                    optimiseImage(writerDetail.data().profilePicture),
                    writerDetail.data().location,
                    writerDetail.data().dateJoined.toDate().toLocaleString(),
                    writerDetail.data().isVerified
                );

                writerList.push(writer);
            });

            // TODO: need to get total number of documents in collection from firestore... but how??
            const count = await db.collection('counter').doc('writer').get();
            res.set('Content-Range', count.data().count);
            res.send(writerList.splice(range[0], range[1] + 1)); // retrieve records per page
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const getWriter = async (req, res) => {
    try {
        const { userId } = req.params;
        const writer = await firestore.collection('user').doc(userId).get();
        console.log(writer);
        if (!writer.exists) {
            res.status(404).send('Writer with this Id not found');
        } else {
            const writerDetails = new Writer(
                writer.id,
                writer.data().role,
                writer.data().bio,
                writer.data().username,
                optimiseImage(writer.data().profilePicture),
                writer.data().location,
                writer.data().dateJoined.toDate().toLocaleString(),
                writer.data().isVerified
            );
            res.send(writerDetails);
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
};

const deleteWriter = async (req, res, next) => {
    try {
        const { userId } = req.params;
        await admin
            .auth()
            .deleteUser(userId)
            .catch((err) => {
                throw new Error(err);
            });

        await firestore.collection('user').doc(userId).delete();

        db.collection('counter')
            .doc('writer')
            .update({ count: firebase.firestore.FieldValue.increment(-1) });

        res.status(200).send(
            "Deleted writer's authentication, user data successfully."
        );
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
};

const updateWriter = async (req, res) => {
    try {
        const { userId } = req.params;
        const { id, dateJoined, ...updatedData } = req.body;
        const writer = await firestore
            .collection('user')
            .doc(userId)
            .update(updatedData);

        res.status(200).json(req.body);
    } catch (error) {
        return res.status(400).send(error);
    }
};

const getWriterUsername = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await firestore.collection('user').doc(userId).get();
        const { username } = user.data();
        res.status(200).send(username);
    } catch (error) {
        res.status(400).send('An unexpected error has occured: ', error);
    }
};

module.exports = {
    addWriter,
    adminCreateWriter,
    adminAddWriter,
    getAllWriter,
    getWriter,
    deleteWriter,
    updateWriter,
    getWriterUsername,
};

// exports.getAllWriter = functions.https.onRequest(getAllWriter);
