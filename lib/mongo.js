const { MongoClient } = require('mongodb')

// const mongoHost = process.env.MONGO_HOST
// const mongoPort = process.env.MONGO_PORT || 27017
// const mongoUser = process.env.MONGO_USER
// const mongoPassword = process.env.MONGO_PASSWORD
// const mongoDbName = process.env.MONGO_DB_NAME
// const mongoUrl = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDbName}`
const mongoUrl = "mongodb://final-database:password@0.0.0.0:27017/final-database"

console.log(mongoUrl)

let db = null
exports.connectToDb = function (callback) {
    MongoClient.connect(mongoUrl, function (err, client) {
        if (err) {
            throw err
        }
        db = client.db('final-database')
        callback()
    })
}

exports.getDbInstance = function () {
    return db
}