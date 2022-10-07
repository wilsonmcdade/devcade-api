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
// db.openConnection((client) => {
//     return 0;
// });

app.use(express.static('build'));
app.use(express.json());
app.use(middleware.requestLogger);

//app.use('/api/notes', notesRouter);
app.use('/api/games', gamesRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;