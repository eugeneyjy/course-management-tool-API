const { Router } = require("express");
const multer = require("multer");
const crypto = require('crypto')
const fs = require('fs/promises')

const { validateAgainstSchema } = require("../lib/validation");
const { fileTypes } = require("../lib/fileTypes");
const { submissionSchema, insertNewSubmission, getSubmissionById, updateSubmissionGradeById } = require("../models/submission");

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
                  student: `/users/${req.body.studentId}`,
                  submission: `/submissions/${id}`
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

router.get('/:submissionId', async function(req, res, next) {
    try {
        const submission = await getSubmissionById(req.params.submissionId)
        if (submission) {
          const resBody = {
            _id: submission._id,
            assignmentId: submission.metadata.assignmentId,
            studentId: submission.metadata.studentId,
            url: `/media/submissions/${submission.filename}`,
            mimetype: submission.metadata.mimetype,
            link: {
                assignment: `/assignments/${submission.metadata.assignmentId}`,
                student: `/users/${submission.metadata.studentId}`
            }
          }
          res.status(200).send(resBody)
        } else {
          next()
        }
      } catch (err) {
        console.error(err)
        res.status(500).send({
            error: "Unable to fetch submission.  Please try again later."
        })
      }
})

router.patch('/:submissionId', async function (req, res, next) {
    try {
        if (req.body && req.body.grade) {
            const submissionId = req.params.submissionId
            const success = await updateSubmissionGradeById(submissionId, req.body.grade)
            if (success) {
                res.status(204).send()
            } else {
                res.status(404).send({
                    error: "Specified submissoinId not found"
                })
            }
        } else {
            res.status(400).send({
                error: "Request body is not a valid submission patch object"
            })
        }
    } catch (err) {
        if (err === 'ObjectIdError') {
            res.status(400).send({
                error: 'Invalid ID format for submissionId.'
            })
        }
        next(err)
    }
})

module.exports = router