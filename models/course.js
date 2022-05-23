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

exports.getCourseById = async function getCourseById(courseId) {
    const db = getDbInstance()
    const collection = db.collection('courses')
    try {
        const course = await collection.aggregate([
            { $match: { _id: new ObjectId(courseId) } }
        ]).toArray()
        return course[0]
    } catch (e) {
        return null
    }
}

exports.updateCourseById = async function updateCourseById(courseId, course) {
    const courseValues = {
        subject:  course.subject,
        number: course.number,
        title: course.title,
        term: course.term,
        instructorId: course.instructorId
    }
    const db = getDbInstance()
    const collection = db.collection('courses')
    try {
        const result = await collection.replaceOne(
            { _id: new ObjectId(courseId) },
            courseValues
        )
        return result.matchedCount > 0;
    } catch(e)
    {
        return null
    }
}