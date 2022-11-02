const os = require('os');
const config = require('../utils/config');
const logger = require('../utils/logger');
const db = require('../utils/database');
const gamesRouter = require('express').Router();
const { PythonShell } = require('python-shell');

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
        // Received an invalid file type (only accept zips)
        res.status(400).send("Only .zip files are allowed!");
    } else {
        // The actual file
        const file = req.file;
        // The name of the game
        const game_name = req.body.title;

        console.log(game_name);
        console.log(file);

        const query = 
                "INSERT INTO " + 
                "game(game_id, author_username, upload_date, game_name) " +
                `VALUES ('${file.filename.split('.')[0]}', 'PLACEHOLDER_AUTHOR', NOW(), '${game_name}');`;
            //console.log(query);


            // Attempt to upload game to the s3 bucket
            const options = {
                mode: 'text',
                pythonOptions: ['-u'],
                scriptPath: 'pythonScripts',
                args: [file.filename.split('.')[0]]
            };
            
            PythonShell.run('boto.py', options, (err, result) => {
                if (err) {
                    throw err;
                }

                // Success, so create game record in the database
                const pool = db.createPool();

                pool.connect((err, client, release) => {
                    if (err) {
                        return console.error('Error acquiring client', err.stack);
                    }
    
                    client.query(query, (err, result) => {
                        release();
                        if (err) {
                            return console.error('Error executing query', err.stack);
                        }
                    });
                });

                for (var r in result) {
                    console.log(result[r]);
                }
                //console.log('result: ', result.toString());
            });


            
    
        // if (queryFailed) {
        //     res.status(500).send("Upload game failed! Try again later.");
        // } else {
        //     res.sendStatus(200);
        // }
    }
});


/**************** GET ROUTES ****************/

gamesRouter.get('/download/:gameId', async (req, res) => {
    const val = req.params.gameId;
    
});

module.exports = gamesRouter;