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
    .delete(deleteNewsFeed, decreaseCount);

newsRouter.route('/').get(getAllNews).post(createNewsFeed, increaseCount);
newsRouter.get('/newsOfWriter/:writerId', getAllNewsByWriter);

module.exports = newsRouter;
