const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary');
const config = require('./config');

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const writerRoutes = require('./routes/writerRoutes');
const newsRouter = require('./routes/newsFeedRoutes');

// const authorizedUserChecker = require('./middleware/authorizedUserChecker')

const app = express();
// const PORT = process.env.PORT
const httpServer = require('http').createServer(app);

cloudinary.config(config.cloudinaryConfig);

app.use(cors({ origin: true }));
app.use(express.json({ limit: '15360mb' }));
app.use(
    express.urlencoded({
        extended: true,
        limit: '15360mb',
        parameterLimit: 500000000,
    })
);

app.use(
    cors({
        exposedHeaders: ['Content-Range'],
    })
);

// Authentication check
// app.use(authorizedUserChecker);

app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/writer', writerRoutes);
app.use('/api/newsFeed', newsRouter);

app.get('/', (req, res) => {
    console.log('Test passed');
    res.send('Server is up and running.');
});

// app.listen(PORT, () => console.log("Server running on " + PORT));
// httpServer.listen(3000, () => console.log('Server running on ' + 3000))

exports.ethlabs = functions.https.onRequest(app);
