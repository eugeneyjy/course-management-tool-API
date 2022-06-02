const { Router } = require("express");
const { getBucketDownloadStream } = require("../models/media");

const router = Router()

/*
 * GET /media/photos/{filename} - Route to download uploaded file.
 * TODO: Maybe verify if user can download the file
 */
router.get('/submissions/:filename', function (req, res, next) {
    getBucketDownloadStream(req.params.filename, 'submissions')
        .on('file', function(file) {
            res.status(200).type(file.metadata.mimetype)
        })
        .on('error', function(err) {
            if (err.code === 'ENOENT') {
                next()
            } else {
                next(err)
            }
        })
        .pipe(res)
})

module.exports = router