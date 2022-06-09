const redis = require('redis')

const redisHost = process.env.REDIS_HOST || 'localhost'
const redisPort = process.env.REDIS_PORT
const redisUrl = `redis://${redisHost}:${redisPort}`

let redisClient = null

exports.connectToRedis = async function() {
    console.log("== connection to redis on: ", `redis://${redisHost}:${redisPort}`)
    redisClient = redis.createClient({ url: redisUrl })
    redisClient.on('error', (err) => {
        console.log('Redis Client Error')
        throw (err)
    })
    await redisClient.connect()
}

exports.getRedisClient = function() {
    return redisClient
}