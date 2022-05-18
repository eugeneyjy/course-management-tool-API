const { Router } = require('express')

// const { } = require('../lib/validation')
// const {} = require('../models/assignment')

const router = Router()

// Create a new Assignment.
router.post('/',function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVED`
    })
})

// Fetch data about a specific Assignment.
router.get('/:assignmentId',function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVED`
    })
})

// Update data for a specific Assignment.
router.patch('/:assignmentId',function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVED`
    })
})

// Remove a specific Assignment from the database.
router.delete('/:assignmentId',function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVED`
    })
})

// Fetch the list of all Submissions for an Assignment.
router.get('/:assignmentId/submissions',function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVED`
    })
})

// Create a new Submission for an Assignment.
router.post('/:assignmentId/submissions',function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVED`
    })
})




























module.exports = router;