const { ObjectId } = require('mongodb')
const { getDbInstance } = require('../lib/mongo')
const { extractValidFields } = require('../lib/validation')







const userSchema = {
    name: { required: true },
    email: { required: true },
    password: { required: true },
    role: { required: true },
    courses: { required: false }
}
exports.userSchema = userSchema;

exports.checkEmailUnique = async function checkEmailUnique (email) {
    const db = getDbInstance()
    const collection = db.collection('users')
    const totalEmail = await collection.find({ email: email }).toArray()
    if (totalEmail.length > 0 ){
        return false
    }
    else {
        return true
    }
}

exports.insertNewUser = async function insertNewUser(newUser) {
    const db = getDbInstance()
    const collection = db.collection('users')
    user = extractValidFields(newUser, userSchema)
    const result = await collection.insertOne(user)
    return result.insertedId
}

 async function getUserById(userId) {
    const db = getDbInstance()
    const collection = db.collection('users')
    try {
        const user = await collection.aggregate([
            { $match: { _id: new ObjectId(userId) } }
        ]).toArray()
        return user[0]
    } catch (e) {
        return null
    }
}
exports.getUserById = getUserById