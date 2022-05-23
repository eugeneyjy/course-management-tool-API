const { Router } = require('express')

const { validateAgainstSchema } = require('../lib/validation')
const { assignmentSchema, insertNewAssignment, getAssignmentById, updateAssignmentById } = require('../models/assignment')

const router = Router()

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
router.post('/:assignmentId/submissions',function (req, res, next) {
    // THIS IS GONNA REQUIRE MULTIPART/FORMDATA SO IGNORE FOR NOW
    res.status(201).send({
        msg: `REQUEST RECEIVED`
    })
})




























module.exports = router;