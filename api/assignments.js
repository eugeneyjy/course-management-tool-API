const { Router } = require('express')

const { validateAgainstSchema } = require('../lib/validation')
const { assignmentSchema } = require('../models/assignment')

const router = Router()

// Create a new Assignment.
router.post('/',function (req, res, next) {
    if (validateAgainstSchema(req.body, assignmentSchema)) {
        res.status(201).send({
            id: `PRETEND TO GIVE ID`
        })
    } 
    else {
        res.status(400).send({
            error: "The request body was either not present or did not contain a valid Assignment object"
        })
    }
})

// Fetch data about a specific Assignment.
router.get('/:assignmentId',function (req, res, next) {
    // PRETEND THIS IS CODE FINDING THE ASSIGNMENT
    // PRETEND THIS IS AN IF/ELSE STATEMENT CHECKING IF ASSIGNMENT EXISTS IN THE DATABASE
    res.status(200).send({  
        courseId: 111111,
        title: "Assignment 3 Example",
        points: 1111111,
        due: "2022-06-14T17:00:00-07:00"
    })
    // PRETEND THIS IS THE ELSE PART
    // res.status(404).send({
    //     error: "Specified assignmentId not found."
    // })
})

// Update data for a specific Assignment.
router.patch('/:assignmentId',function (req, res, next) {
    if (req.body) {
        // PRETEND THIS IS CODE FINDING THE ASSIGNMENT
        // PRETEND THIS IS AN IF/ELSE STATEMENT CHECKING IF ASSIGNMENT EXISTS IN THE DATABASE
        res.status(200).send({})
        // PRETEND THIS IS THE ELSE PART
        // res.status(404).send({
        //     error: "Specified assignmentId not found."
        // })
    } 
    else {
        res.status(400).send({
            error: "The request body was not present"
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