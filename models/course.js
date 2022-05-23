const { ObjectId } = require('mongodb')
const { getDbInstance } = require('../lib/mongo')
const { extractValidFields } = require('../lib/validation')








const courseSchema = {
    subject: { required: true },
    number: { required: true },
    title: { required: true },
    term: { required: true },
    instructorId: { required: true }
}
exports.courseSchema = courseSchema;



exports.insertNewCourse = async function insertNewCourse(newCourse) {
    const db = getDbInstance()
    const collection = db.collection('courses')
    course = extractValidFields(newCourse, courseSchema)
    const result = await collection.insertOne(course)
    return result.insertedId
}