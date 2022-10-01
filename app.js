const config = require('./utils/config');
const express = require('express');
const app = express();
const middleware = require('./utils/middleware');
const logger = require('./utils/logger');
const pg = require('pg');

// Routers
//const notesRouter = require('./controllers/notes');


// ##### POSTGRES CONNECTION #####
const client = new pg.Client({
    host: config.PSQL_URI,
    user: config.PSQL_USER,
    port: config.PORT,
    password: config.PSQL_PASS,
    database: config.PSQL_USER,
    ssl: true
});

client.connect().catch(e => console.log(e));

logger.info(`connecting to {
    host: ${client.host},
    user: ${client.user},
    port: ${client.port},
    password: ${client.password},
    database: ${client.database}
}`);

app.use(express.static('build'));
app.use(express.json());
app.use(middleware.requestLogger);

//app.use('/api/notes', notesRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;