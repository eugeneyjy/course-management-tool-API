const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const jwtsecret = crypto.randomBytes(256).toString('base64')

exports.generateAuthToken =  function (userId) {
  const payload = { sub: userId }
  return jwt.sign(payload, jwtsecret, { expiresIn: '24h' })
}