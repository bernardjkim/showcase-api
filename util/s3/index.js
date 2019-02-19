const AWS = require('aws-sdk');
const bluebird = require('bluebird');

const config = require('../../config/config');

// configure the keys for accessing AWS
AWS.config.update({
  accessKeyId: config.aws.id,
  secretAccessKey: config.aws.key,
});

// configure AWS to work with promises
AWS.config.setPromisesDependency(bluebird);

// Create S3 service object
const s3 = new AWS.S3();

/**
 * This function will attempt to retreive a file from the S3 bucket.
 *
 * @param   {string}  key S3 bucket key (file identifier)
 *
 * @return  {Promise}     file data
 */
function getFile(key) {
  const params = { Bucket: config.aws.bucket, Key: key };
  return s3.getObject(params).promise();
}

/**
 * This function will attempt to upload a file to the S3 bucket.
 *
 * @param   {object}  buffer  file buffer
 * @param   {string}  name    file name
 * @param   {object}  type    file type
 *
 * @return  {Promise}         s3 upload response
 */
function uploadFile(buffer, name, type) {
  const params = {
    // ACL: "public-read",
    Body: buffer,
    Bucket: config.aws.bucket,
    ContentType: type.mime,
    Key: name,
  };
  return s3.upload(params).promise();
}

module.exports = {
  getFile,
  uploadFile,
};
