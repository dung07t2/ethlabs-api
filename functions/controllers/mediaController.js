const catchAsync = require('../utils/catchAsync');
const cloudinary = require('cloudinary');
const { db } = require('../firebaseConfig');

// middleware
const uploadMedia = catchAsync(async (req, res, next) => {
    if (req.body.profilePicture) {
        const uid = req.params.userId || req.body.id;
        await cloudinary.v2.uploader
            .upload(
                req.body.profilePicture,
                {
                    folder: `/${req.body.role}/${uid}/`,
                    public_id: 'profile_image',
                },
                (error, result) => {
                    if (result) {
                        req.body.profilePicture = result.secure_url;
                    }
                }
            )
            .catch(
                (err) =>
                    (req.body.profilePicture =
                        // dummy profile pic if the one provided is invalid
                        'http://dreamvilla.life/wp-content/uploads/2017/07/dummy-profile-pic.png')
            );
    }
    next();
});

const deleteMedia = catchAsync(async (req, res, next) => {
    const uid = req.body.id;
    cloudinary.v2.uploader.destroy(
        // send image path from the front end side e.g. '/writer/uid/profile_pic'
        req.body.imagePath,
        (error, result) => {
            if (result.result === 'ok') {
                const FieldValue = db.FieldValue;
                db.collection('sponsor')
                    .doc(uid)
                    .update({ profilePicture: FieldValue.delete() });

                res.status(200).json({
                    status: 'success',
                });
            } else if (error) {
                console.log(error);
                res.status(error.http_code).json({
                    error,
                });
            } else {
                res.status(404).json({
                    status: result.result,
                });
            }
        }
    );
    next();
});

// function to manipulate cloudinary url to optimise image loading
const optimiseImage = (imageUrl) => {
    if (imageUrl) {
        const imageUrlArray = imageUrl.split('upload/');
        return imageUrlArray[0] + 'upload/q_auto/' + imageUrlArray[1];
    } else {
        return 'http://dreamvilla.life/wp-content/uploads/2017/07/dummy-profile-pic.png';
    }
};

module.exports = {
    uploadMedia,
    deleteMedia,
    optimiseImage,
};
