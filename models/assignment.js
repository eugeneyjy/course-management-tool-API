const { ObjectId, GridFSBucket } = require('mongodb')
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

exports.deleteAssignmentById = async function deleteAssignmentById(id) {
    const db = getDbInstance()
    const assignments = db.collection('assignments')
    const submissions = db.collection('submissions.files')
    const bucket = new GridFSBucket(db, { bucketName: 'submissions' })
    await assignments.remove({ _id: ObjectId(id) })
    await submissions
        .find({ "metadata.assignmentId": ObjectId(id) })
        .forEach(submission => {
            bucket.delete(submission._id)
        })
}

exports.bulkInsertNewAssignments = async function bulkInsertNewAssignments(assignments) {
    const assignmentsToInsert = assignments.map(assignment => {
        assignment._id = new ObjectId(assignment._id.$oid)
        assignment.courseId = new ObjectId(assignment.courseId)
        return assignment
    })
    const db = getDbInstance()
    const collection = db.collection('assignments')
    const result = await collection.insertMany(assignmentsToInsert)
    return result.insertedIds
}