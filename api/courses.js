const { Router } = require('express')

// const { } = require('../lib/validation')
// const {} = require('../models/course')
const { validateAgainstSchema } = require('../lib/validation')
const { courseSchema, insertNewCourse, getCourseById, updateCourseById } = require('../models/course')


const router = Router()

// Fetch the list of all courses.
router.get('/', function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVEDd`
    })
})

// Create a new course.
router.post('/', async function (req, res, next) {
    if (validateAgainstSchema(req.body, courseSchema)) {
        const id = await insertNewCourse(req.body)
        res.status(201).send({
            id: id
        })
    } 
    else {
        res.status(400).send({
            error: "The request body was either not present or did not contain a course object"
        })
    }
})

// Fetch data about a specific Course.
router.get('/:courseId', async function (req, res, next) {
    const course = await getCourseById(req.params.courseId)
    if (course) {
        res.status(200).send({
            subject: course.subject,
            number: course.number,
            title: course.title,
            term: course.term,
            instructorId: course.instructorId
        })
    }
    else {
        res.status(404).send({
            error: "Specified courseId not found."
        })
    }
})

// Update data for a specific Course.
router.patch('/:courseId', async function (req, res, next) {
    const course = await getCourseById(req.params.courseId)
    if(course === null){
        res.status(404).json({
            error: "Specified courseId not found."
        })
    }
    if (validateAgainstSchema(req.body, courseSchema)) {
        const updateSuccessful = await updateCourseById(req.params.courseId, req.body)
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