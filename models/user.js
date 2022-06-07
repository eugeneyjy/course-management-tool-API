const { ObjectId } = require('mongodb')
const { getDbInstance } = require('../lib/mongo')
const { extractValidFields } = require('../lib/validation')
const bcrypt = require('bcryptjs')

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
    user.password = await bcrypt.hash(user.password, 8)
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

exports.getUserByEmail = async function getUserByEmail(email) {
    const db = getDbInstance()
    const collection = db.collection('users')
    const user = await collection.findOne({ email: email })
    return user
}

exports.bulkInsertNewUsers = async function bulkInsertNewUsers(users) {
    const usersToInsert = await Promise.all(users.map(async(user) => {
        user._id = new ObjectId(user._id.$oid)
        user.password = await bcrypt.hash(user.password, 8)
        return user
    }))
    const db = getDbInstance()
    const collection = db.collection('users')
    const result = await collection.insertMany(usersToInsert)
    return result.insertedIds
}

exports.getUserRole = async function getUserRole(userId) {
    const db = getDbInstance()
    const collection = db.collection('users')
    try {
        const user = await collection.aggregate([
            { $match: { _id: new ObjectId(userId) } }
        ]).toArray()
        return user[0].role
    } catch (e) {
        return null
    }
}
