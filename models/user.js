const { ObjectId } = require('mongodb')
const { getDbInstance } = require('../lib/mongo')








const userSchema = {
    name: { required: true },
    email: { required: true },
    password: { required: true },
    role: { required: true }
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