const { Router } = require('express')
const multer = require('multer')
const crypto = require('crypto')
const fs = require('fs/promises')

const { validateAgainstSchema } = require('../lib/validation')
const { assignmentSchema, insertNewAssignment, getAssignmentById, updateAssignmentById } = require('../models/assignment')
const { getPaginatedSubmissionsByAidAndSid, getPaginatedSubmissionsByAid } = require('../models/submission')
const { fileTypes } = require('../lib/fileTypes')
const { requireAuthentication, isUserAdmin } = require('../lib/auth')
const { getCourseById, getInstructorId } = require('../models/course')

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
router.post('/',requireAuthentication, async function (req, res, next) {
    if (validateAgainstSchema(req.body, assignmentSchema)) {
        const admin = await isUserAdmin(req.userId)
        const course = await getCourseById(req.body.courseId)

        if(admin || course.instructorId == req.userId) {
            const id = await insertNewAssignment(req.body)
            res.status(201).send({
                id: id
            })
        }
        else {
            res.status(403).send({
                error: "The request was not made by an admin or the instructor of the course"
            })
        }
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
router.patch('/:assignmentId',requireAuthentication, async function (req, res, next) {
    const assignment = await getAssignmentById(req.params.assignmentId)
    if(assignment === null){
        res.status(404).json({
            error: "Specified courseId not found."
        })
    }
    if (validateAgainstSchema(req.body, assignmentSchema)) {
        const admin = await isUserAdmin(req.userId)
        const course = await getCourseById(req.body.courseId)
        if(admin || course.instructorId == req.userId) {
            const updateSuccessful = await updateAssignmentById(req.params.assignmentId, req.body)
            if (updateSuccessful) {
            res.status(200).send()
            } 
            else {
                next()
            }
        }
        else {
            res.status(403).send({
                error: "The request was not made by an admin or the instructor of the course"
            })
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
router.get('/:assignmentId/submissions', requireAuthentication, async function (req, res, next) {
    try {
        const assignmentId = req.params.assignmentId
        const studentId = req.query.studentId
        const assignment = await getAssignmentById(assignmentId)
        if (assignment) {
            const isAdmin = await isUserAdmin(req.userId)
            const isInstructor = (await getInstructorId(assignment.courseId)).toString() === req.userId
            if (isAdmin || isInstructor) {
                let paginatedSubmissions = null
                let page = parseInt(req.query.page) || 1;
                page = page < 1 ? 1 : page;
                const countPerPage = 10;
                const start = (page - 1) * countPerPage;
                if(studentId) {
                    paginatedSubmissions = await getPaginatedSubmissionsByAidAndSid(
                        assignmentId, studentId, start, countPerPage
                    )
                } else {
                    paginatedSubmissions = await getPaginatedSubmissionsByAid(
                        assignmentId, start, countPerPage
                    )
                }
                res.status(200).send(paginatedSubmissions)
            } else {
                res.status(403).send({
                    error: "The request was not made by an admin or the instructor of the course"
                })
            }
        } else {
            res.status(404).send({
                error: "Specified assignmentId not found."
            }) 
        }
    } catch (err) {
        if (err === 'ObjectIdError') {
            res.status(400).send({
                error: 'Invalid ID format for assignmentId or studentId.'
            })
        }
        next(err)
    }
})

module.exports = router;