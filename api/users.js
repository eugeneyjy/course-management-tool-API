const { Router } = require('express')

// const { } = require('../lib/validation')
// const {} = require('../models/user')

const router = Router()

// Create new User
router.post('/',function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVED`
    })
})

// Log in User
router.post('/login',function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVED`
    })
})

// Fetch data about a specific user
router.get('/:userId',function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVED`
    })
})























module.exports = router;