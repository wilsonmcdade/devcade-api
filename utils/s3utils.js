const jszip = require('jszip');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { hashElement } = require('folder-hash');
const { PythonShell } = require('python-shell');
const db = require('../utils/database');

/**
 * Assumes file being unzip is stored in ~/uploads and
 * unzips file to its respective directory in ~/uploads
 * 
 * Returns:
 *  - name of game directory if validation/unzipping was successful
 *  - false if validation failed or unzipping was unsuccessful
 */
const unzipFile = async (file_uuid) => {
    const fileContent = fs.readFileSync(`uploads/${file_uuid}.zip`);
    const jszipInstance = new jszip();
    const result = await jszipInstance.loadAsync(fileContent);

    const validZipContentFiles = verifyZipContent(result);        
    if (!validZipContentFiles) {
        // zip file may have been missing content
        return false;
    }

    const keys = Object.keys(result.files);

    try {
        if (fs.existsSync(`uploads/${file_uuid}`)) {
            // File has already been unzipped
            return false;
        }
        // create the file to place items in
        fs.mkdirSync(`uploads/${file_uuid}`);
    
        // create files and put them into the directory
        for (let key of keys) {
            const item = result.files[key];
            if (item.dir) {
                fs.mkdirSync(`uploads/${file_uuid}/${item.name}`);
            } else {
                fs.writeFileSync(`uploads/${file_uuid}/${item.name}`, Buffer.from(await item.async('arraybuffer')));
            }
        }
    } catch {
        // failed to create temporary files somewhere
        return false;
    }

    // return validated files
    return validZipContentFiles;
}

/**
 * Helper function that hecks to see that zip file 
 * contains 3 files:
 *  - A folder (assumed to contain game data)
 *  - icon.png/jpg (an icon image for the game)
 *  - banner.png/jpg (a banner image for the game)
 * 
 * Returns:
 *  - true if soft validation succeeded
 *  - false if soft validation failed
 */
const verifyZipContent = async (zipContent) => {
    // get file keys
    const keys = Object.keys(zipContent.files).filter(key => {
        const keyNameArr = key.split('/');
        return keyNameArr.length === 1 || (keyNameArr.length === 2 && keyNameArr[1].length === 0);
    });

    // make sure num files is 3
    if (keys.length !== 3) {
        // missing required files
        return false;
    }

    // make sure there is only one directory
    const numDirs = keys.reduce((sum, key) => {
        return zipContent.files[key].dir ? sum + 1 : sum
    }, 0);

    if (numDirs !== 1) {
        // should only have one game directory
        return false;
    }

    // make sure icon.png or icon.jpg exists
    const media = keys.filter(key => {
        const splitKey = key.split('.');
        return !zipContent.files[key].dir && 
            (splitKey[0] === 'icon' || splitKey[0] === 'banner') &&
            (splitKey[1] === 'png' || splitKey[1] === 'jpg' || splitKey[1] === 'jpeg');
    });

    const invalidMedia = media.find(key => {
        const splitKey = key.split('.');
        return splitKey[0] !== 'icon' && 
            splitKey[0] !== 'banner' &&
            splitKey[1] !== 'png' &&
            splitKey[1] !== 'jpg' &&
            splitKey[1] !== 'jpeg';
    });

    if (invalidMedia) {
        // some file aside from the required files exists
        return false;
    }

    // return the name of the game directory
    return {
        gameDir: keys.find(key => zipContent.files[key].dir),
        iconFilename: media.find(key => key.split('.')[0] === 'icon'),
        bannerFilename: media.find(key => key.split('.')[0] === 'banner')
    };
}

/**
 * Hashes game files and returns a MD5 hash of
 * the game files used for versioning
 * 
 * Returns:
 *  - MD5 hash
 *  - false if hashing failed
 */
const hashGameFiles = async (file_uuid, gameDirName) => {
    // TODO: remove '*' -- this is here for testing purposes
    const options = {
        files: { include: ['*', '*.cs', '*.json'] }
    }

    try {
        return await hashElement(`uploads/${file_uuid}/${gameDirName}`, options);
    } catch {
        return false;
    }
}

/**
 * Zips game files only back into {file_uuid}.zip and uploads
 * this zip, along with the banner and icon files
 * 
 * Returns:
 *  - game file hash if successful
 *  - false if an issue occurred
 */
const zipGameFilesAndUpload = async (file_uuid, zipContentFiles) => {
    try {
        // hash game files
        const gameFileHash = await hashGameFiles(file_uuid, zipContentFiles.gameDir);
        if (!gameFileHash) {
            // failed to hash game file
            return false;
        }
        
        // zip game files
        await zipDirectory(
            `uploads/${file_uuid}/${zipContentFiles.gameDir}`, 
            `uploads/${file_uuid}/${file_uuid}.zip`
        );

        // get proper files for uploading to s3
        const s3UploadFiles = [
            file_uuid, 
            ...Object.values(zipContentFiles)
                .filter(fname => fname !== zipContentFiles.gameDir)
            ];

        s3UploadFiles.forEach(item => console.log(item));

        // Attempt to upload game to the s3 bucket
        const options = {
            mode: 'text',
            pythonOptions: ['-u'],
            scriptPath: 'pythonScripts',
            args: s3UploadFiles
        };
        // upload files to s3 bucket via PythonShell
        const pyPromise = new Promise((resolve, reject) => {
            PythonShell.run('boto.py', options, (err, result) => {
                if (err) {
                    reject(err)
                    //throw err;
                }
                resolve(result);
                //console.log(result);
            });
        });

        const pyResult = await pyPromise;
        if (pyResult.length === 0 || pyResult[0] !== 'success') {
            throw pyResult;
        }
        return gameFileHash
    } catch(err) {
        console.log(err);
        return false;
    }
}

/**
 * @param {String} sourceDir: /some/folder/to/compress
 * @param {String} outPath: /path/to/created.zip
 * @returns {Promise}
 */
const zipDirectory = (sourceDir, outPath) => {
    const archive = archiver('zip', { zlib: { level: 9 }});
    const stream = fs.createWriteStream(outPath);

    return new Promise((resolve, reject) => {
        archive
            .directory(sourceDir, false)
            .on('error', err => reject(err))
            .pipe(stream);

        stream.on('close', () => resolve());
        archive.finalize();
    });
}

/**
 * Pauses current thread for time ms
 * @param {int} time in ms 
 * @returns 
 */
 const delay = (time) => {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

/**
 * delete local files associated with the game
 * @param {String} file_uuid 
 * @returns 
 */
const deleteLocalFiles = async (file_uuid) => {
    try {
        // attempt to delete uploaded zip since it isn't needed anymore
        if (fs.existsSync(`uploads/${file_uuid}.zip`)) {
            fs.unlinkSync(`uploads/${file_uuid}.zip`);
            console.log(`deleted: uploads/${file_uuid}.zip`);
        }
        // attempt to delete unzipped files since they aren't needed anymore 
        if (fs.existsSync(`uploads/${file_uuid}`)) {
            await (async () => {
                fs.rmdir(`uploads/${file_uuid}`, { recursive: true, force: true }, async (err) => {
                    console.log("waiting for subdirectories to be deleted...")
                    while (fs.readdirSync(`uploads/${file_uuid}`).length !== 0) {
                        await delay(250);
                    }
                    fs.rmdirSync(`uploads/${file_uuid}`);
                    console.log(`deleted: uploads/${file_uuid}`);
                });
            })();
        }   
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

module.exports = {
    unzipFile,
    hashGameFiles,
    zipGameFilesAndUpload,
    deleteLocalFiles
};