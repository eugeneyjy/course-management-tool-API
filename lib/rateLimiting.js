const { requireAuthenticationFunction } = require("./auth")
const { getRedisClient } = require("./redis")

exports.rateLimit = async function(req, res, next) {
    const redisClient = getRedisClient()
    let userIdentifier = req.ip
    let rateLimitMaxRequests = 10
    const userId = requireAuthenticationFunction(req)
    // If user is authenticated, give them 30 requests per minute
    // and rate limit based on per user basis
    if (userId) {
        rateLimitMaxRequests = 30
        userIdentifier = userId
    }
    const rateLimitWindowMs = 60000

    let tokenBucket
    try {
        tokenBucket = await redisClient.hGetAll(userIdentifier)
    } catch (e) {
        console.log("== tokenBucketError", e)
        next()
        return
    }
    tokenBucket = {
    tokens: parseFloat(tokenBucket.tokens) || rateLimitMaxRequests,
    last: parseInt(tokenBucket.last) || Date.now()
    }
    console.log("== userIdentifier: ", userIdentifier)
    console.log("== tokenBucket: ", tokenBucket)
    const now = Date.now()
    const ellapsedMs = now - tokenBucket.last
    tokenBucket.tokens += ellapsedMs * (rateLimitMaxRequests / rateLimitWindowMs)
    tokenBucket.tokens = Math.min(rateLimitMaxRequests, tokenBucket.tokens)
    tokenBucket.last = now

    if (tokenBucket.tokens >= 1) {
        tokenBucket.tokens -= 1
        await redisClient.hSet(userIdentifier, [['tokens', tokenBucket.tokens], ['last', tokenBucket.last]])
        next()
    } else {
        await redisClient.hSet(userIdentifier, [['tokens', tokenBucket.tokens], ['last', tokenBucket.last]])
        res.status(429).send({
            err: "Too many requests per minute"
        })
    }
}
