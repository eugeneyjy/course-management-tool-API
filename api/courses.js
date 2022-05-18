const { Router } = require('express')

// const { } = require('../lib/validation')
// const {} = require('../models/course')

const router = Router()

// Fetch the list of all courses.
router.get('/', function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVED`
    })
})

// Create a new course.
router.post('/',function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVED`
    })
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