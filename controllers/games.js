const os = require('os');
const config = require('../utils/config');
const logger = require('../utils/logger');
const gamesRouter = require('express').Router();

// utilities
const multer = require('multer');
const { ListBucketsCommand } = require('@aws-sdk/client-s3');
const { s3Client } = require('../utils/s3Client');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `${process.cwd()}/uploads`)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});
const upload = multer({storage: storage});

gamesRouter.post('/upload', upload.single('file'), async (req, res) => {
    const title = req.body.title;
    const file = req.file;

    console.log(title);
    console.log(file);

    const response = await s3Client.send(new ListBucketsCommand({}));

    console.log(response);

    res.sendStatus(200);
});

module.exports = gamesRouter;