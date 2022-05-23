const { Router } = require('express')

// const { } = require('../lib/validation')
// const {} = require('../models/course')
const { validateAgainstSchema } = require('../lib/validation')
const { courseSchema, insertNewCourse } = require('../models/course')


const router = Router()

// Fetch the list of all courses.
router.get('/', function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVEDd`
    })
})

// Create a new course.
router.post('/', async function (req, res, next) {
    console.log("WE HERE OIN POST")
    if (validateAgainstSchema(req.body, courseSchema)) {
        const id = await insertNewCourse(req.body)
        res.status(201).send({
            id: id
        })
    } 
    else {
        res.status(400).send({
            error: "The request body was either not present or did not contain a valid User object"
        })
    }
})

// Fetch data about a specific Course.
router.get('/:courseId',function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVED`
    })
})

// Update data for a specific Course.
router.patch('/:courseId',function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVED`
    })
})

// Remove a specific Course from the database.
router.delete('/:courseId',function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVED`
    })
})

// Fetch a list of the students enrolled in the Course.
router.get('/:courseId/students',function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVED`
    })
})

// Update enrollment for a Course.
router.post('/:courseId/students',function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVED`
    })
})

// Fetch a CSV file containing list of the students enrolled in the Course.
router.get('/:courseId/roster',function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVED`
    })
})

// Fetch a list of the Assignments for the Course.
router.get('/:courseId/assignments',function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVED`
    })
})



























module.exports = router;