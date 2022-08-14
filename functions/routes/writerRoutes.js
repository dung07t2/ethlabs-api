const express = require('express');
const {
    addWriter,
    adminCreateWriter,
    adminAddWriter,
    getAllWriter,
    getWriter,
    updateWriter,
    deleteWriter,
    getWriterUsername,
} = require('../controllers/writer/writerController');
const { uploadMedia } = require('../controllers/mediaController');
const { increaseCount } = require('../controllers/countController');

const writerRouter = express.Router();

writerRouter
    .route('/')
    .get(getAllWriter)
    .post(
        adminCreateWriter,
        uploadMedia,
        increaseCount,
        adminAddWriter,
        increaseCount
    );

writerRouter
    .route('/:userId')
    .post(uploadMedia, increaseCount, addWriter, increaseCount)
    .get(getWriter)
    .put(uploadMedia, updateWriter)
    // include role in req.body from frontend
    .delete(deleteWriter);

writerRouter.route('/getWriterUsername/:userId').get(getWriterUsername);

module.exports = writerRouter;
