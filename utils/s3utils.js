const jszip = require('jszip');
const fs = require('fs');
const md5File = require('md5-file')
const archiver = require('archiver');

/**
 * Assumes file being unzip is stored in ~/uploads and
 * unzips file to its respective directory in ~/uploads
 * 
 * Returns:
 *  - true if unzipping was successful
 *  - false if validation failed or unzipping was unsuccessful
 */
const unzipFile = async (file_uuid) => {
    const fileContent = fs.readFileSync(`../uploads/${file_uuid}.zip`);
    const jszipInstance = new jszip();
    const result = await jszipInstance.loadAsync(fileContent);

    const gameFilesDirName = verifyZipContent(result);        
    if (!gameFilesDirName) {
        // zip file may have been missing content
        return false;
    }

    const keys = Object.keys(result.files);

    try {
        if (fs.existsSync(`../uploads/${file_uuid}`)) {
            // File has already been unzipped
            return false;
        }
        // create the file to place items in
        fs.mkdirSync(`../uploads/${file_uuid}`);
    
        // create files and put them into the directory
        for (let key of keys) {
            const item = result.files[key];
            if (item.dir) {
                fs.mkdirSync(`../uploads/${file_uuid}/${item.name}`);
            } else {
                fs.writeFileSync(`../uploads/${file_uuid}/${item.name}`, Buffer.from(await item.async('arraybuffer')));
            }
        }
    } catch {
        // failed to create temporary files somewhere
        return false;
    }

    // return game dir name
    return gameFilesDirName;
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
const veryifyZipContent = async (zipContent) => {
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

    if (!invalidMedia) {
        // some file aside from the required files exists
        return false;
    }

    // return the name of the game directory
    return keys.find(key => zipContent.files[key].dir);
}

/**
 * Hashes game files and returns a MD5 hash of
 * the game files used for versioning
 * 
 * Returns:
 *  - MD5 hash
 */
const hashGameFiles = async (file_uuid, gameDirName) => {
    return await md5File(`../uploads/${file_uuid}/${gameDirName}`);
}

/**
 * Zips game files only back into {file_uuid}.zip and uploads
 * this zip, along with the banner and icon files
 * 
 * Returns:
 *  - true if succeeded
 *  - false if an issue occurred
 */
const zipGameFilesAndUpload = async (file_uuid, gameDirName) => {
    try {
        // zip files
        zipDirectory(
            `../uploads/${file_uuid}`, 
            `../uploads/${file_uuid}/${file_uuid}.zip`
        );
        
        // upload files to s3 bucket via PythonShell
    } catch {
        return false;
    }

    return true;
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

module.exports = {
    unzipFile,
    veryifyZipContent,
    hashGameFiles,
    zipGameFilesAndUpload
};