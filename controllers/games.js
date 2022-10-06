const os = require('os');
const S3 = require('aws-s3');

const logger = require('../utils/logger');
const gamesRouter = require('express').Router();

const multer = require('multer');
const { countBy } = require('underscore');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `${process.cwd()}/uploads`)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});
const upload = multer({storage: storage});

gamesRouter.post('/upload', upload.single('file'), (req, res) => {
    const title = req.body.title;
    const file = req.file;

    console.log(title);
    console.log(file);
    console.log(`Current directory: ${process.cwd()}`);

    const config = {
        bucketName: 'devcade',
        dirName: 'devcade',
        region: 'eu-west-1',
        accessKeyId: 'devcade2022AccessKeyinconstantly38254-unaccomplished',
        secretAccessKey: 'devcade2022SecretKeylabor-intensive1699-wretchedness'
    }

    const S3Client = new S3(config);
    S3Client.upload()

    res.sendStatus(200);
});

module.exports = gamesRouter;