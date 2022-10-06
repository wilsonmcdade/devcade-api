require('dotenv').config();

const API_PORT = process.env.API_PORT;

const PSQL_PORT = process.env.PSQL_PORT;
const PSQL_USER = process.env.PSQL_USER;
const PSQL_PASS = process.env.PSQL_PASS;
const PSQL_URI = process.env.PSQL_URI;

const S3_ACCESSKEYID = process.env.S3_ACCESSKEYID;
const S3_SECRETACCESSKEY = process.env.S3_SECRETACCESSKEY;

module.exports = {
    API_PORT,
    PSQL_PORT,
    PSQL_USER,
    PSQL_PASS,
    PSQL_URI,
    S3_ACCESSKEYID,
    S3_SECRETACCESSKEY
};