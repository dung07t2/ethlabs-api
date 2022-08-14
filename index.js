const express = require('express')
const cors = require('cors')
const cloudinary = require('cloudinary')
const config = require('./config')

const userRoutes = require('./routes/userRoutes')
const adminRoutes = require('./routes/adminRoutes')
const writerRoutes = require('./routes/writerRoutes')

const authorizedUserChecker = require('./middleware/authorizedUserChecker')

const app = express()
const PORT = process.env.PORT || config.port
const httpServer = require('http').createServer(app)

cloudinary.config(config.cloudinaryConfig)

app.use(cors())
app.use('/api/webhook', express.raw({ type: '*/*' }))
app.use(express.json({ limit: '15360mb' }))
app.use(
    express.urlencoded({
        extended: true,
        limit: '15360mb',
        parameterLimit: 500000000,
    })
)

app.use(
    cors({
        exposedHeaders: ['Content-Range'],
    })
)

// Authentication check
// app.use(authorizedUserChecker);

app.use('/api/user', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/writer', writerRoutes);

app.get('/', (req, res) => {
    console.log('Test passed')
    res.send('Server is up and running.')
})

// app.listen(PORT, () => console.log("Server running on " + PORT));
httpServer.listen(PORT, () => console.log('Server running on ' + PORT))
