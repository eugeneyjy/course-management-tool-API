const { Router } = require("express");
const multer = require("multer");
const crypto = require('crypto')
const fs = require('fs/promises')

const { validateAgainstSchema } = require("../lib/validation");
const { fileTypes } = require("../lib/fileTypes");
const { submissionSchema, insertNewSubmission } = require("../models/submission");

const router = Router()

const upload = multer({
    storage: multer.diskStorage({
      destination: `${__dirname}/uploads`,
      filename: function (req, file, callback) {
        const ext = fileTypes[file.mimetype]
        const filename = crypto.pseudoRandomBytes(16).toString('hex')
        callback(null, `${filename}.${ext}`)
      }
    }),
    fileFilter: function (req, file, callback) {
      callback(null, !!fileTypes[file.mimetype])
    }
})


router.post('/', upload.single('file'), async function (req, res, next) {
    if(validateAgainstSchema(req.body, submissionSchema)) {
        try {
            // Submission object, exclude grade. Grade should only be entered when update.
            const submission = {
                assignmentId: req.body.assignmentId,
                studentId: req.body.studentId,
                timestamp: req.body.timestamp,
                path: req.file.path,
                filename: req.file.filename,
                mimetype: req.file.mimetype
            }
            const id = await insertNewSubmission(submission)
            // Remove local temp file from multer
            await fs.unlink(req.file.path)

            res.status(201).send({
                id: id,
                links: {
                  assignment: `/assignments/${req.body.assignmentId}`,
                  student: `/user/${req.body.studentId}`,
                  submission: `/submission/${id}`
                }
            })
        } catch (err) {
            // Catch err when assignment with :assignmentId is not present
            // TODO: Maybe put custom error into enum
            if(err === 'Assignment not found') {
                res.status(404).send({
                    error: `Assignment with id: ${req.params.assignmentId} not found`
                })
            } else {
                res.status(500).send({
                    error: "Error inserting submission file into DB.  Please try again later."
                })
            }
        }
    } else {
        res.status(400).send({
            error: "Request body is not a valid submission object"
        })
    }
})

module.exports = router