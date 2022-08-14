const { db, firebase } = require('../../firebaseConfig');
const catchAsync = require('../../utils/catchAsync');
const firestore = db;
const NewsFeed = require('../../models/newsFeed');

// create news
const createNewsFeed = async (req, res) => {
    try {
        const data = req.body;
        const writer = await firestore
            .collection('user')
            .doc(req.body.postedBy)
            .get();
        if (!writer.exists) {
            res.status(404).send('Invalid user id provided!');
        } else if (writer.data().role !== 'writer') {
            res.status(400).send('You cannot create new feeds!');
        } else {
            const newsFeed = {
                ...data,
                postedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            firestore.collection('newsFeed').add(newsFeed);
            res.status(200).json({ success: true });
            // Update newsFeed counter
            await firestore
                .collection('counter')
                .doc('newsFeed')
                .update({
                    count: firebase.firestore.FieldValue.increment(1),
                });
        }
    } catch (error) {
        res.status(400).send('An unexpected error has occured: ', error);
    }
};

// edit a news Feed
const editNewsFeed = async (req, res) => {
    const docRef = firestore.collection('newsFeed').doc(req.params.newsId);
    docRef
        .get()
        .then((doc) => {
            if (doc.exists) {
                firestore
                    .collection('newsFeed')
                    .doc(req.params.newsId)
                    .set(req.body)
                    .then(() => {
                        res.status(200).json(req.body);
                    })
                    .catch((error) => {
                        console.error('Error writing document: ', error);
                        res.status(400).send(error);
                    });
            } else {
                res.status(404).send('No news found with provided ID!');
            }
        })
        .catch((error) => {
            console.log('Error getting news document:', error);
            res.status(400).send('An unexpected error has occured: ', error);
        });
};

const deleteNewsFeed = async (req, res) => {
    const docRef = firestore.collection('newsFeed').doc(req.params.newsId);

    docRef
        .get()
        .then((doc) => {
            if (doc.exists) {
                firestore
                    .collection('newsFeed')
                    .doc(req.params.newsId)
                    .delete()
                    .then(() => {
                        res.status(200).send('A news successfully deleted!');
                    })
                    .catch((error) => {
                        console.error('Error removing document: ', error);
                        res.status(400).send(error);
                    });
                // decrease newsFeed counter
                firestore
                    .collection('counter')
                    .doc('newsFeed')
                    .update({
                        count: firebase.firestore.FieldValue.increment(-1),
                    });
            } else {
                res.status(404).send('No news found with provided ID!');
            }
        })
        .catch((error) => {
            console.log('Error getting news document:', error);
            res.status(400).send('An unexpected error has occured: ', error);
        });
};

// retrieve all news
const getAllNews = async (req, res) => {
    /*example query from admin interface
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
        const newsList = [];

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
            // latestDoc = req.query.latest;
            latestDoc = await firestore
                .collection('newsFeed')
                .doc(req.query.latest)
                .get();
        }

        const newsFeeds = await firestore.collection('newsFeed');

        if (req.query.filter !== '{}') {
            //search username
            data = await newsFeeds.where(key, '==', filterBy[key]).get();
        } else if (req.query.sort) {
            if (!req.query.latest) {
                //pagination - table view on admin interface (less efficient due to firebase's limitations) &&
                //range provided increases e.g. 5 records per page -> [0,4] -> [5,9]
                //pagination - infinite scroll on mobile app - 1st batch
                data = await newsFeeds
                    .orderBy(sortBy[0], sortBy[1])
                    .limit(limit)
                    .get();
            }
        } else {
            if (req.query.latest) {
                //pagination - infinite scroll on mobile app - 2nd batch onwards
                //range provided stays the same e.g. 5 records per page -> [0,4] throughout
                data = await newsFeeds.startAfter(latestDoc).limit(limit).get();
            } else if (req.query.range) {
                data = await newsFeeds.limit(limit).get();
            } else {
                //for mobile app before implementing infinite scroll
                data = await newsFeeds.get();
            }
        }
        
        if (data.empty) {
            res.set('Content-Range', 0);
            res.status(200).send(newsList);
        } else {
            data.forEach((doc) => {
                const news = new NewsFeed(
                    doc.id,
                    doc.data().title,
                    doc.data().content,
                    doc.data().postedBy,
                    new Date(doc.data().postedAt.toDate()).toUTCString(),
                    doc.data().link,
                    doc.data().contentUrls,
                    doc.data().imgUrls
                );
                newsList.push(news);
                // console.log(doc.data());
            });
            const count = await db.collection('counter').doc('newsFeed').get();
            // console.log(count.data());
            const totalNews = count.data().count;
            res.set('Content-Range', totalNews);
            // res.set('Content-Range', 3);
            res.status(200).send({ results: newsList.splice(range[0], range[1] + 1), total: range[1] + 1 > totalNews ? totalNews : range[1] + 1});
        }
    } catch (error) {
        console.log('Error getting documents: ', error);
        return res.status(400).send('An unexpected error has occured: ', error);
    }
};

// get all news by writer
const getAllNewsByWriter = async (req, res) => {
    firestore
        .collection('newsFeed')
        .where('postedBy', '==', req.params.writerId)
        .get()
        .then((querySnapshot) => {
            const newsList = [];
            querySnapshot.forEach((doc) => {
                const news = new NewsFeed(
                    doc.id,
                    doc.data().title,
                    doc.data().content,
                    doc.data().postedBy,
                    doc.data().postedAt,
                    doc.data().link,
                    doc.data().contentUrls,
                    doc.data().imgUrls
                );
                newsList.push(news);
            });
            res.status(200).send({ results: newsList, total: newsList.length });
        })
        .catch((error) => {
            console.log('Error getting documents: ', error);
            res.status(400).send('An unexpected error has occured: ', error);
        });
};

// retrieve news details
const getSpecificNews = async (req, res) => {
    var docRef = firestore.collection('newsFeed').doc(req.params.newsId);

    docRef
        .get()
        .then((doc) => {
            if (!doc.exists) {
                res.status(404).send('News with provided ID does not exist!');
            } else {
                const news = new NewsFeed(
                    doc.id,
                    doc.data().title,
                    doc.data().content,
                    doc.data().postedBy,
                    doc.data().postedAt,
                    doc.data().link,
                    doc.data().contentUrls,
                    doc.data().imgUrls
                );
                res.status(200).send(news);
            }
        })
        .catch((error) => {
            console.log('Error getting gig document:', error);
            res.status(400).send('An unexpected error has occured: ', error);
        });
};

// delete all news of a writer
const deleteNewsOfWriter = catchAsync(async (req, res, next) => {
    const batch = db.batch();
    let count = 0;

    firestore
        .collection('newsFeed')
        .where('postedBy', '==', req.params.writerId)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                count += 1;
                batch.delete(doc.ref);
            });

            batch.commit();

            db.collection('counter')
                .doc('newsFeed')
                .update({
                    count: firebase.firestore.FieldValue.increment(-count),
                });

            next();
        });
});

module.exports = {
    createNewsFeed,
    editNewsFeed,
    getAllNews,
    getAllNewsByWriter,
    getSpecificNews,
    deleteNewsFeed,
    deleteNewsOfWriter,
};
