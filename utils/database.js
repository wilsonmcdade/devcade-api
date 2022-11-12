const config = require('./config');
const logger = require('../utils/logger');
const pg = require('pg');

const createPool = () => new pg.Pool({
    host: config.PSQL_URI,
    user: config.PSQL_USER,
    port: config.PSQL_PORT,
    password: config.PSQL_PASS,
    database: config.PSQL_USER,
    ssl: true
});

async function query(q) {
    const client = await pool.connect();
    let res;
    try {
        await client.query('BEGIN');
        try {
            res = await client.query(q);
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        }
    } finally {
        client.release();
    }
    return res;
}



const openConnection = async (callback) => {
    const client = new pg.Client({
        host: config.PSQL_URI,
        user: config.PSQL_USER,
        port: config.PSQL_PORT,
        password: config.PSQL_PASS,
        database: config.PSQL_USER,
        ssl: true
    });

    logger.info(`connecting to {
        host: ${client.host},
        user: ${client.user},
        port: ${client.port},
        password: ${client.password},
        database: ${client.database}
    }`);

    try {
        await client.connect()
            .then(res => console.log("Connected to DB"));
        await callback(client).then(() => console.log());
    } finally {
        //await client.end()
        //    .then(res => console.log("Disconnected from DB"));
    }
};

module.exports = {
    createPool,
    query
};