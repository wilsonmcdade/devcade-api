// const config = require('./utils/config');
const db = require('./utils/database');
const express = require('express');
const app = express();
const middleware = require('./utils/middleware');
const logger = require('./utils/logger');
const pg = require('pg');
const gamesRouter = require('./controllers/games');

// Routers
//const notesRouter = require('./controllers/notes');


// ##### POSTGRES CONNECTION #####
db.connect()
    .then(res => {
        console.log("Connected to DB");
        // do work
    })
    .catch(err => console.log(err));

db.disconnect()

logger.info(`connecting to {
    host: ${db.client.host},
    user: ${db.client.user},
    port: ${db.client.port},
    password: ${db.client.password},
    database: ${db.client.database}
}`);

app.use(express.static('build'));
app.use(express.json());
app.use(middleware.requestLogger);

//app.use('/api/notes', notesRouter);
app.use('/api/games', gamesRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;