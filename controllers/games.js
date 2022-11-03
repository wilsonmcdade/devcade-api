const os = require('os');
const config = require('../utils/config');
const logger = require('../utils/logger');
const db = require('../utils/database');
const s3utils = require('../utils/s3utils');
const gamesRouter = require('express').Router();

// utilities
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { fstat } = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `${process.cwd()}/uploads`)
    },
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}.zip`);
    }
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/zip") {
            req.fileValidationError = "Only .zip files are allowed!";
            return cb(null, false)
        }
        cb(null, true);
    }    
});


/**************** POST ROUTES ****************/

gamesRouter.post('/upload', upload.single('file'), async (req, res) => {
    if (req.fileValidationError) {
        // Received an invalid file type (only accept zips)
        res.status(400).send("Only .zip files are allowed!");
    } else {
        // The actual file
        const file = req.file;
        // The name of the game
        const game_name = req.body.title;

        console.log(game_name);
        console.log(file);

        const file_uuid = file.filename.split('.')[0];

        // unzip file
        // check zip contains 3 files: one dir, two files (icon.png/jpg and banner.png/jpg)
        const zipContent = await s3utils.unzipFile(file_uuid)
        

        if (!zipContent) {
            // failed to unzip or verify zip file content
            s3utils.deleteLocalFiles(file_uuid);
            return res.status(500).send("Upload game failed! Try again later.");
        }

        // hash and zip game files, then upload each file to the s3 bucket individually
        const gameFileHash = await s3utils.zipGameFilesAndUpload(file_uuid, zipContent);

        console.log(`uploadStatus: ${(gameFileHash ? 'success' : 'failed')}`);

        if (!gameFileHash) {
            // failed to hash, zip or upload game files to s3 bucket
            s3utils.deleteLocalFiles(file_uuid);
            return res.status(500).send("Upload game failed! Try again later.");
        }
        
        // if all of this succeeded, record game (title, s3 uuid, author name, game files hash value)        
        const query = 
            "INSERT INTO " + 
            "game(game_id, author_username, upload_date, game_name, hash) " +
            `VALUES ('${file.filename.split('.')[0]}', 'PLACEHOLDER_AUTHOR', NOW(), '${game_name}', '${gameFileHash.hash}');`;
        console.log(query);

        // Success, so create game record in the database
        try {
            db.pool.connect((err, client, release) => {
                if (err) {
                    console.error('Error acquiring client', err.stack);
                }

                client.query(query, (err, result) => {
                    release();
                    if (err) {
                        console.error('Error executing query', err.stack);
                    }
                });
            });
        } catch (err) {
            s3utils.deleteLocalFiles(file_uuid);
            return res.status(500).send("Upload game failed! Try again later.");
        }

        // delete all files related to the game from the server since they are stored in s3
        const delRes = s3utils.deleteLocalFiles(file_uuid);

        // game file successfully uploaded
        return res.sendStatus(200);
    }
});

/**************** GET ROUTES ****************/

gamesRouter.get('/download/:gameId', async (req, res) => {
    const val = req.params.gameId;
    
});

module.exports = gamesRouter;