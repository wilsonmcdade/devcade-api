const os = require('os');
const config = require('../utils/config');
const logger = require('../utils/logger');
const db = require('../utils/database');
const gamesRouter = require('express').Router();

// utilities
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

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
        res.status(400).send("Only .zip files are allowed!");
    } else {
        const file = req.file;
        const game_name = req.body.title;

        console.log(game_name);
        console.log(file);

        var queryFailed = true;
        db.openConnection(async (client) => {
            const query = 
                "INSERT INTO " + 
                "game(game_id, author_username, upload_date, game_name) " +
                `VALUES ('${file.filename.split('.')[0]}', 'PLACEHOLDER_AUTHOR', CURRENT_DATE, '${game_name}');`;
            console.log(query);
            await client.query(query, (err, res) => {
                if (err) {
                    queryFailed = true;
                    console.log(err.stack);
                } else {
                    console.log("Success");
                }
            });
        });
    
        if (queryFailed) {
            res.status(500).send("Upload game failed! Try again later.");
        } else {
            res.sendStatus(200);
        }
    }
});


/**************** GET ROUTES ****************/

gamesRouter.get('/download/:gameId', async (req, res) => {
    const val = req.params.gameId;
    
});

module.exports = gamesRouter;