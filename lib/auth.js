const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { getUserById } = require('../models/user')
const jwtsecret = crypto.randomBytes(256).toString('base64')

exports.generateAuthToken =  function (userId) {
  const payload = { sub: userId }
  return jwt.sign(payload, jwtsecret, { expiresIn: '24h' })
}

// Authenticate user and grant them a token (middleware)
exports.requireAuthentication = function (req, res, next) {
    const authHeader = req.get('authorization') || ''
    const authParts = authHeader.split(' ')
    const token = authParts[0] === 'Bearer' ? authParts[1] : null
  
    try {
      const payload = jwt.verify(token, jwtsecret)
      req.userId = payload.sub
      next()
    } catch (err) {
      res.status(401).send({
          error: "Invalid authentication token"
      })
    }
}

exports.requireAuthenticationFunction = function (req, res) {
    const authHeader = req.get('authorization') || ''
    const authParts = authHeader.split(' ')
    const token = authParts[0] === 'Bearer' ? authParts[1] : null
  
    try {
      const payload = jwt.verify(token, jwtsecret)
      return payload.sub
    } catch (err) {
      return undefined
    }
} 

// Check if an authenticated user is admin
exports.isUserAdmin = async function (userId) {
    try {
        const user = await getUserById(userId)
        if (user && user.role === 'admin') {
            return true
        } else {
            return false
        }
    } catch (err) {
        console.log(err)
        return false
    }
}