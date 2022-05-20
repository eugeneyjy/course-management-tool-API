const { Router } = require('express')

const { validateAgainstSchema } = require('../lib/validation')
const { userSchema, checkEmailUnique, insertNewUser } = require('../models/user')

const router = Router()

// Create new User
router.post('/', async function (req, res, next) {
    const emailCheck = await checkEmailUnique(req.body.email)
    if (validateAgainstSchema(req.body, userSchema) && emailCheck) {
        const id = await insertNewUser(req.body)
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

// Log in User
router.post('/login',function (req, res, next) {
    if (req.body && req.body.email && req.body.password) {
        try {
            res.status(200).send({
                token: `PRETEND TO GIVE TOKEN`
            })
        } 
        catch (err) {
            res.status(500).send({
              error: "An internal server error occurred."
            })
        }
    } 
    else {
        res.status(400).send({
            error: "The request body was either not present or did not contain all of the required fields"
        })
    }
})

// Fetch data about a specific user
router.get('/:userId',function (req, res, next) {
    // PRETEND THIS IS CODE FINDING THE USER 
    // PRETEND THIS IS AN IF/ELSE STATEMENT CHECKING IF USER EXISTS IN THE DATABASE
    res.status(200).send({  
            name: "example",
            email: "examplej@oregonstate.edu",
            password: "example2",
            role: "student" 
    })
    // PRETEND THIS IS THE ELSE PART
    // res.status(404).send({
    //     error: "Specified userId not found."
    // })
})























module.exports = router;