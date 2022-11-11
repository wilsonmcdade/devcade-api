const fs = require('fs');
const path = require('path');
const config = require('./config');
const Minio = require('minio');
const DOWNLOADS_DIR = 'downloads';
const UPLOADS_DIR = 'uploads';

const minioClientConfig = {
    endPoint: config.S3_ENDPOINT,
    useSSL: true,
    accessKey: config.S3_ACCESSKEYID,
    secretKey: config.S3_SECRETACCESSKEY
};

const s3 = new Minio.Client(minioClientConfig);


const uploadGameFile = async (gameId, basename) => {
    try {

        const file_path = `${UPLOADS_DIR}/${gameId}`;//file_name.replace('\\', '/').split('/').slice(0, -1).join('/');
        const file_name = `${file_path}/${basename}`;

        if (!fs.existsSync(file_path) || !fs.existsSync(file_name)) {
            throw "ERRMISSING";
        }

        var fileStream = fs.createReadStream(file_name);
        fileStream.on('error', (err) => {
            console.log('File Error', err)
        });

        var fileStat = await fs.stat(file_name, async (err, stats) => {
            if (err) {
                throw err;
            }
            await s3.putObject(
                config.S3_GAMES_BUCKET, 
                `${gameId}/${basename}`,
                fileStream,
                stats.size,
                (err, objInfo) => {
                    if (err) {
                        throw err;
                    }
                    console.log('Upload Success', objInfo);
                });
        });
    } catch (e) {
        console.log('Error:', e);
        throw e;
    }
};

const downloadGame = async (gameId) => {
    try {
        // create download directory if it does not exist
        const file_path = `${DOWNLOADS_DIR}/${gameId}`
        if (!fs.existsSync(file_path)) {
            fs.mkdirSync(file_path, { recursive: true });
        }

        // Download the game zip
        const file_dest = `${file_path}/${gameId}.zip`;
        const key = `${gameId}/${gameId}.zip`;
            await s3.fGetObject(
                config.S3_GAMES_BUCKET, 
                key,
                file_dest,
                (err) => {
                    if (err) {
                        throw err
                    }
                    console.log(`Downloaded ${key}`);
                });
    } catch (e) {
        console.log('Error:', e);
    }
};

const downloadMedias = async (gameId) => {
    try {
        // create download directory if it does not exist
        const file_path = `${DOWNLOADS_DIR}/${gameId}/medias`
        if (!fs.existsSync(file_path)) {
            fs.mkdirSync(file_path, { recursive: true });
        }

        // Get the s3 keys of the game's icon and banner
        const mediaKeys = (await getBucketObjects(config.S3_GAMES_BUCKET, gameId)).filter(obj => 
            obj.name.includes(`${gameId}/icon`) || obj.name.includes(`${gameId}/banner`)
        ).map(media => media.name);

        // Download each object
        await mediaKeys.forEach(async (key, i) => {
            const file_dest = `${file_path}/${path.basename(key)}`;
            await s3.fGetObject(
                config.S3_GAMES_BUCKET, 
                key,
                file_dest,
                (err) => {
                    if (err) {
                        throw err
                    }
                    console.log(`Downloaded ${key}`);
                });
        });
    } catch (e) {
        console.log('Error:', e);
    }
};

const getAllBuckets = () => {
    try {
        s3.listBuckets((err, buckets) => {
            console.log(buckets);
        });
    } catch (e) {
        console.log('Error:', e);
    }
};

const getBucketObjects = async (bucket, prefix = '') => {
    const objectsList = await new Promise((resolve, reject) => {
        const objectsListTemp = [];
        
        var stream = s3.listObjectsV2(bucket, prefix, true, '')
        
        stream.on('data', (obj) => objectsListTemp.push(obj));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(objectsListTemp));
    });
    //console.log(objectsList);
    return objectsList;
};

const getGamesBucketObjects = async (gameId) => {
    return await getBucketObjects(config.S3_GAMES_BUCKET, gameId);
}

const testGameId = "66f3b024-92da-478e-8985-8c030de46a48";

//uploadGameFile(testGameId, `${UPLOADS_DIR}/${testGameId}.zip`)
//uploadGameFile(testGameId, `${UPLOADS_DIR}/icon.png`)
//uploadGameFile(testGameId, `${UPLOADS_DIR}/banner.png`)
//getAllBuckets();
//downloadGame(testGameId);
//downloadMedias(testGameId);
//getBucketObjects(config.S3_GAMES_BUCKET);;

module.exports = {
    uploadGameFile,
    downloadGame,
    downloadMedias,
    getGamesBucketObjects,
    getAllBuckets
};