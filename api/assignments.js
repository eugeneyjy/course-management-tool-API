const { Router } = require('express')
const multer = require('multer')
const crypto = require('crypto')
const fs = require('fs/promises')

const { validateAgainstSchema } = require('../lib/validation')
const { assignmentSchema, insertNewAssignment, getAssignmentById, updateAssignmentById } = require('../models/assignment')
const { submissionSchema, insertNewSubmission } = require('../models/submission')
const { fileTypes } = require('../lib/fileTypes')

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

// Create a new Assignment.
router.post('/', async function (req, res, next) {
    if (validateAgainstSchema(req.body, assignmentSchema)) {
        const id = await insertNewAssignment(req.body)
        res.status(201).send({
            id: id
        })
    } 
    else {
        res.status(400).send({
            error: "The request body was either not present or did not contain a valid Assignment object"
        })
    }
})

// Fetch data about a specific Assignment.
router.get('/:assignmentId', async function (req, res, next) {
    const assignment = await getAssignmentById(req.params.assignmentId)
    if (assignment) {
        res.status(200).send({
            courseId: assignment.courseId,
            title: assignment.title,
            points: assignment.points,
            due: assignment.due
        })
    }
    else {
        res.status(404).send({
            error: "Specified assignmentId not found."
        })
    }
})

// Update data for a specific Assignment.
router.patch('/:assignmentId', async function (req, res, next) {
    const assignment = await getAssignmentById(req.params.assignmentId)
    if(assignment === null){
        res.status(404).json({
            error: "Specified courseId not found."
        })
    }
    if (validateAgainstSchema(req.body, assignmentSchema)) {
        const updateSuccessful = await updateAssignmentById(req.params.assignmentId, req.body)
        if (updateSuccessful) {
        res.status(200).send()
        } 
        else {
            next()
        }
    }
    else {
        res.status(400).json({
            error: "Request body is not a valid course object"
        })
    }
})

// Remove a specific Assignment from the database.
router.delete('/:assignmentId',function (req, res, next) {
    // PRETEND THIS IS CODE FINDING THE ASSIGNMENT
    // PRETEND THIS IS AN IF/ELSE STATEMENT CHECKING IF ASSIGNMENT EXISTS IN THE DATABASE
    res.status(204).send({})
    // PRETEND THIS IS THE ELSE PART
    // res.status(404).send({
    //     error: "Specified assignmentId not found."
    // })
})

// Fetch the list of all Submissions for an Assignment.
router.get('/:assignmentId/submissions',function (req, res, next) {
    // PRETEND THIS IS CODE FINDING LIST OF SUBMISSIONS
    // PRETEND THIS IS AN IF/ELSE STATEMENT CHECKING IF ASSIGNMENT EXISTS IN THE DATABASE
    res.status(201).send({
        submissions: [
            {
              "assignmentId": 123,
              "studentId": 123,
              "timestamp": "2022-06-14T17:00:00-07:00",
              "grade": 94.5,
              "file": "string"
            }
          ]
    })
    // PRETEND THIS IS THE ELSE PART
    // res.status(404).send({
    //     error: "Specified assignmentId not found."
    // })
})

// Create a new Submission for an Assignment.
router.post('/:assignmentId/submissions', upload.single('file'), async function (req, res, next) {
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
                  student: `/user/${req.body.studentId}`
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

module.exports = router;