const express = require('express');
const {
    createNewsFeed,
    editNewsFeed,
    getAllNews,
    getAllNewsByWriter,
    getSpecificNews,
    deleteNewsFeed,
    deleteNewsOfWriter,
} = require('../controllers/feeds/newsFeedController');

const {
    increaseCount,
    decreaseCount,
} = require('../controllers/countController');
// const { uploadMedia } = require('../controllers/mediaController');

const newsRouter = express.Router();

// router methods go below
newsRouter
    .route('/:newsId')
    .get(getSpecificNews)
    .put(editNewsFeed)
    .delete(decreaseCount, deleteNewsFeed);

newsRouter.route('/').get(getAllNews).post(increaseCount, createNewsFeed);
newsRouter.get('/newsOfWriter/:writerId', getAllNewsByWriter);

module.exports = newsRouter;
