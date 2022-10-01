require('dotenv').config();

const PORT = process.env.PORT;
const PSQL_USER = process.env.PSQL_USER;
const PSQL_PASS = process.env.PSQL_PASS;
const PSQL_URI = process.env.PSQL_URI;

module.exports = {
    PORT,
    PSQL_USER,
    PSQL_PASS,
    PSQL_URI
};