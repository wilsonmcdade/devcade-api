require('dotenv').config();

const PORT = process.env.PORT;
const MONGODB_USER = process.env.MONGODB_USER;
const MONGODB_SERVER = process.env.MONGODB_SERVER;
const MONGODB_PASS = encodeURIComponent(process.env.MONGODB_PASS);

module.exports = {
    PORT,
    MONGODB_USER,
    MONGODB_SERVER,
    MONGODB_PASS
};