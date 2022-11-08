const aws = require('@aws-sdk/client-s3');
const config = require('./config');
// Set the AWS Region.
const REGION = "us-east-2"; //e.g. "us-east-1"
// Create an Amazon S3 service client object.
const s3Client = new aws.S3({ 
    endpoint: config.S3_ENDPOINT,
    accessKeyId: config.S3_ACCESSKEYID,
    secretAccessKey: config.S3_SECRETACCESSKEY,
    region: REGION 
});
module.exports = {
    s3Client
};