const bcrypt = require('bcryptjs')
const { Router } = require('express')

const { validateAgainstSchema } = require('../lib/validation')
const { generateAuthToken, isUserAdmin, requireAuthenticationFunction } = require('../lib/auth')
const { userSchema, checkEmailUnique, insertNewUser, getUserByEmail, getUserById } = require('../models/user')

const router = Router()

// Create new User
router.post('/', async function (req, res, next) {
    const emailCheck = await checkEmailUnique(req.body.email)
    if (validateAgainstSchema(req.body, userSchema) && emailCheck) {
        if (req.body.role === 'admin' || req.body.role === 'instructor') {
            const userId = requireAuthenticationFunction(req, res)
            if (userId) {
                const admin = await isUserAdmin(userId)
                if (admin) {
                    const id = await insertNewUser(req.body)
                    res.status(201).send({ id: id })
                } else {
                    res.status(403).send({
                        error: "User need to be an Admin in order to create Admin user or Instructor user"
                    })
                }
            } else {
                res.status(401).send({
                    error: "Invalid authentication token"
                })
            }
        } else {
            const id = await insertNewUser(req.body)
            res.status(201).send({ id: id })
        }
    } 
    else {
        res.status(400).send({
            error: "The request body was either not present or did not contain a valid User object"
        })
    }
})

// Log in User
router.post('/login', async function (req, res, next) {
    if (req.body && req.body.email && req.body.password) {
        const user = await getUserByEmail(req.body.email)
        const authenticated = user && await bcrypt.compare(req.body.password, user.password)
        if (authenticated) {
            const authToken = generateAuthToken(user._id)
            res.status(200).send({ token: authToken })
        } else {
            res.status(401).send({ error: "Invalid authentication credentials" })
        }
    } 
    else {
        res.status(400).send({
            error: "The request body was either not present or did not contain all of the required fields"
        })
    }
})

// Fetch data about a specific user
router.get('/:userId', async function (req, res, next) {
    const user = await getUserById(req.params.userId)
    if (user) {
        res.status(200).send({
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role
        })
    }
    else {
        res.status(404).send({
            error: "Specified userId not found."
        })
    }
})

module.exports = router;