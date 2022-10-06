const app = require('./app'); // the actual Express application
const http = require('http');
const config = require('./utils/config');
const logger = require('./utils/logger');

const server = http.createServer(app);

server.listen(config.API_PORT, () => {
    logger.info(`Server running on port ${config.API_PORT}`);
});