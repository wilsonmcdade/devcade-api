const config = require('./config');
const pg = require('pg');

const client = new pg.Client({
    host: config.PSQL_URI,
    user: config.PSQL_USER,
    port: config.PSQL_PORT,
    password: config.PSQL_PASS,
    database: config.PSQL_USER,
    ssl: true
});

const connect = () => {
    return client.connect();
}

const disconnect = () => {
    client.end();
}

module.exports = {
    client,
    connect,
    disconnect
};