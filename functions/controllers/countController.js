const catchAsync = require('../utils/catchAsync');
const { db, firebase } = require('../firebaseConfig');

// middleware
const increaseCount = catchAsync(async (req, res, next) => {
    const name = req.body.role;
    console.log(name);
    db.collection('counter')
        .doc(name)
        .update({
            count: firebase.firestore.FieldValue.increment(
                req.body.collaborationPhase === 'Completed' ? 2 : 1
            ),
        });

    next();
});

const decreaseCount = catchAsync(async (req, res, next) => {
    try {
        const name = req.body.role;

        db.collection('counter')
            .doc(name)
            .update({ count: firebase.firestore.FieldValue.increment(-1) });

        next();
    } catch (error) {
        console.log(error);
    }
});

module.exports = {
    increaseCount,
    decreaseCount,
};
