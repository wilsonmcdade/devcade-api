const config = require('./utils/config');
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const middleware = require('./utils/middleware');
const logger = require('./utils/logger');
const mongoose = require('mongoose');

// Routers
const notesRouter = require('./controllers/notes');
const contactRouter = require('./controllers/contact');
const authRouter = require('./controllers/auth');

logger.info(`connecting to mongodb+srv://bean217:${config.MONGODB_PASS}@highwireshop.v7swd.mongodb.net/?retryWrites=true&w=majority`);

mongoose.connect(`mongodb+srv://bean217:${config.MONGODB_PASS}@highwireshop.v7swd.mongodb.net/?retryWrites=true&w=majority`)
    .then(() => {
        logger.info(`mongodb://${config.MONGODB_USER}@${config.MONGODB_SERVER}`);
    })
    .catch((error) => {
        logger.error('error connecting to MongoDB:', error.message);
    });
// mongoose.Promise is depractated, override with global.Promise
mongoose.Promise = global.Promise;

app.use(cors({
    // origin domain is the URL of the client
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(cookieParser());
app.use(express.static('build'));
app.use(express.json());
app.use(middleware.requestLogger);

// start TEMPORARY
//app.get('/', (req, res) => {
//    console.log(req);
//    res.send('<h1>Highwire Shop</h1>');
//});
// end TEMPORARY

// app.use('/api/notes', notesRouter);
app.use('/api/contact', contactRouter);
app.use('/api/auth', authRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;