const { ObjectId } = require('mongodb')
const { getDbInstance } = require('../lib/mongo')
const { extractValidFields } = require('../lib/validation')








const assignmentSchema = {
    courseId: { required: true },
    title: { required: true },
    points: { required: true },
    due: { required: true }
}
exports.assignmentSchema = assignmentSchema;

exports.insertNewAssignment = async function insertNewAssignment(newAssignment) {
    const db = getDbInstance()
    const collection = db.collection('assignments')
    assignment = extractValidFields(newAssignment, assignmentSchema)
    const result = await collection.insertOne(assignment)
    return result.insertedId
}

exports.getAssignmentById = async function getAssignmentById(assignmentId) {
    const db = getDbInstance()
    const collection = db.collection('assignments')
    try {
        const user = await collection.aggregate([
            { $match: { _id: new ObjectId(assignmentId) } }
        ]).toArray()
        return user[0]
    } catch (e) {
        return null
    }
}

exports.updateAssignmentById = async function updateAssignmentById(assignmentId, assignment) {
    const courseValues = {
        courseId: assignment.courseId,
        title: assignment.title,
        points: assignment.points,
        due: assignment.due
    }
    const db = getDbInstance()
    const collection = db.collection('assignments')
    try {
        const result = await collection.replaceOne(
            { _id: new ObjectId(assignmentId) },
            courseValues
        )
        return result.matchedCount > 0;
    } catch(e)
    {
        return null
    }
}