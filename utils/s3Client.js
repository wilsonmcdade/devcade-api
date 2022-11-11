const fs = require('fs');
const path = require('path');
const config = require('./config');
const aws = require('aws-sdk');
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const DOWNLOADS_DIR = '../downloads';
const UPLOADS_DIR = '../uploads';

const awsClientConfig = {
    accessKeyId: config.S3_ACCESSKEYID,
    secretAccessKey: config.S3_SECRETACCESSKEY,
    region: config.S3_REGION,
    endpoint: config.S3_ENDPOINT
};

// create local s3 client
//aws.config.setPromisesDependency();
aws.config.update(awsClientConfig);
const s3 = new aws.S3();

const uploadGameFile = (gameId, file_name) => {
    try {

        const file_path = file_name.replace('\\', '/').split('/').slice(0, -1).join('/');
        const basename = path.basename(file_name);

        console.log(file_path);

        if (!fs.existsSync(file_path)) {
            fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        }

        var fileStream = fs.createReadStream(file_name);
        fileStream.on('error', (err) => {
            console.log('File Error', err)
        });
        
        params = {
            Bucket: config.S3_GAMES_BUCKET,
            Key: `${gameId}/${file_name}`,
            Body: fileStream
        };

        s3.upload(params, (err, data) => {
            if (err) {
                console.log("Error", err);
            } else if (data) {
                console.log(`Upload Success`, data.Location);
            }
        });
    } catch (e) {
        console.log('Error:', e);
    }
};

const downloadGame = (gameId) => {
    try {
        Params = {
            Bucket: config.S3_GAMES_BUCKET,
            Key: `${gameId}/${gameId}.zip`
        };
        s3.getObject(params, (err, data) => {
            if (err) {
                console.log(err);
            } else if (data) {
                const filePath = `${DOWNLOADS_DIR}/${gameId}/${gameId}.zip`
                fs.writeFileSync(filePath, data.Body.toString());
                console.log(`${filePath} has been created!`)
            }
        });
    } catch (e) {
        console.log('Error:', e);
    }
};

const downloadMedias = (gameId) => {
    try {
        // Set download parameters to get icon.png
        params = {
            Bucket: config.S3_GAMES_BUCKET,
            Key: `${gameId}/icon.png`
        };
        // Download icon.png locally
        s3.getObject(params, (err, data) => {
            if (err) {
                console.log(err);
            } else if (data) {
                const filePath = `${DOWNLOADS_DIR}/${gameId}/icon.png`
                fs.writeFileSync(filePath, data.Body.toString());
                console.log(`${filePath} has been created!`)
            }
        });
        // Set download parameters ot get banner.png
        downloadParams.Key = `${gameId}/banner.png`;
    } catch (e) {
        console.log('Error:', e);
    }
};

const getAllBuckets = async () => {
    try {
        s3.listBuckets((err, data) => {
            console.log(data.Buckets);
        });
    } catch (e) {
        console.log('Error:', e);
    }
};

const getBucketObjects = async (bucket) => {
    const client = new S3Client({
        region: config.S3_REGION,
        credentials: {
            accessKeyId: config.S3_ACCESSKEYID,
            secretAccessKey: config.S3_SECRETACCESSKEY
        }
    });
    const response = await client.send(new ListObjectsV2Command({
        Bucket: config.S3_GAMES_BUCKET
    }));
    console.log(response);
};

const testGameId = "66f3b024-92da-478e-8985-8c030de46a48";

//getAllBuckets();
//uploadGame("myfile/test");
//downloadMedias("66f3b024-92da-478e-8985-8c030de46a48");
getBucketObjects(config.S3_GAMES_BUCKET);

module.exports = {
    uploadGameFile,
    downloadGame,
    downloadMedias
};