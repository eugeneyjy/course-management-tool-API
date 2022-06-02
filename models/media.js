/*
 * Media data accessor methods
 */

const { GridFSBucket } = require("mongodb")
const { getDbInstance } = require("../lib/mongo")

/*
 * Open a download stream for a file inside GridFS.
 * Return a download stream for the file.
 * @param {string} filename - name of the file stored in GridFS
 * @param {string} bucketName - name of the GridFS bucket to find file from
 */
function getBucketDownloadStream(filename, bucketName) {
    const db = getDbInstance()
    const bucket = new GridFSBucket(db, { bucketName: bucketName })
    return bucket.openDownloadStreamByName(filename)
}
exports.getBucketDownloadStream = getBucketDownloadStream