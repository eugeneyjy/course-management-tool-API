const { GridFSBucket, ObjectId } = require("mongodb");
const fs = require("fs")
const { getDbInstance } = require("../lib/mongo");
const { fileTypes } = require("../lib/fileTypes");

const submissionSchema = {
    assignmentId: { required: true },
    studentId: { required: true },
    timestamp: { required: true },
    grade: { required: false },
}
exports.submissionSchema = submissionSchema;

exports.insertNewSubmission = async function insertNewSubmission(submission) {
    return new Promise(function (resolve, reject) {
        const db = getDbInstance()
        const assignments = db.collection('assignments')
        assignments.findOne({ _id: new ObjectId(submission.assignmentId) })
            .then(result => {
                if (result) {
                    const bucket = new GridFSBucket(db, { bucketName: 'submissions' })
                    const metadata = {
                        assignmentId: new ObjectId(submission.assignmentId),
                        studentId: new ObjectId(submission.studentId),
                        timestamp: submission.timestamp,
                        mimetype: submission.mimetype
                    }
                    const uploadStream = bucket.openUploadStream(submission.filename, {
                        metadata: metadata
                    })
                    fs.createReadStream(submission.path).pipe(uploadStream)
                        .on('error', function (err) {
                            reject(err)
                        })
                        .on('finish', function (result) {
                            bucket.rename(result._id, `${result._id.toString()}.${fileTypes[submission.mimetype]}`)
                            const assignments = db.collection('assignments')
                            assignments.updateOne(
                                { _id: new ObjectId(submission.assignmentId) },
                                { $push: { "submissions": result._id } }
                            )
                            resolve(result._id)
                        })
                } else {
                    reject('Assignment not found')
                }
            })
    })
}

exports.getSubmissionById = async function (id) {
    const db = getDbInstance()
    const bucket = new GridFSBucket(db, { bucketName: 'submissions' })
    if (!ObjectId.isValid(id)) {
        return null
    } else {
        const results = await bucket
            .find({ _id: new ObjectId(id) })
            .toArray()
        return results[0]
    }
}

exports.getPaginatedSubmissionsByAid = async function (assignmentId, start, countPerPage) {
    if (!ObjectId.isValid(assignmentId)) {
        throw ('ObjectIdError')
    }
    const db = getDbInstance()
    const collection = db.collection('submissions.files')

    // Fields to project out after query
    const projection = {
        assignmentId: '$metadata.assignmentId',
        studentId: '$metadata.studentId',
        timestamp: '$metadata.timestamp',
        grade: '$metadata.grade',
        filename: '$filename'
    }

    // Get paginated submissions
    const submissions = await collection
        .find({ 'metadata.assignmentId': new ObjectId(assignmentId) })
        .sort({ _id: 1 })
        .skip(start)
        .limit(countPerPage)
        .project(projection)

    /*
     * Reassign submission.filename with url to download file instead
     * Turn paginated submissions into an array
     */
    const submissionsArray = await submissions
        .map(submission => {
            submission.filename = `/media/submissions/${submission.filename}`
            return submission
        })
        .toArray()

    // Count the total number of submissions that match the query
    const totalCount = await collection.countDocuments({
        'metadata.assignmentId': new ObjectId(assignmentId),
    })

    // Compute pagination information
    const page = (Math.floor(start / countPerPage)) + 1
    const totalPages = (Math.ceil(totalCount / countPerPage))
    const links = {}
    if (page < totalPages) {
        links.nextPage = `/assignments/${assignmentId}/submissions?page=${page + 1}`
        links.lastPage = `/assignments/${assignmentId}/submissions?page=${totalPages}`
    }
    if (page > 1) {
        links.prevPage = `/assignments/${assignmentId}/submissions?page=${page - 1}`
        links.firstPage = `/assignments/${assignmentId}/submissions?page=1`
    }

    const paginatedSubmissions = {
        submissions: submissionsArray,
        pageNumber: page,
        totalPages: totalPages,
        pageSize: countPerPage,
        count: submissionsArray.length,
        totalCount: totalCount,
        links: links
    }
    return paginatedSubmissions
}

exports.getPaginatedSubmissionsByAidAndSid = async function (assignmentId, studentId, start, countPerPage) {
    if (!ObjectId.isValid(assignmentId) || !ObjectId.isValid(studentId)) {
        throw ('ObjectIdError')
    }
    const db = getDbInstance()
    const collection = db.collection('submissions.files')

    // Fields to project out after query
    const projection = {
        assignmentId: '$metadata.assignmentId',
        studentId: '$metadata.studentId',
        timestamp: '$metadata.timestamp',
        grade: '$metadata.grade',
        filename: '$filename'
    }

    // Get paginated submissions
    const submissions = await collection
        .find({
            'metadata.assignmentId': new ObjectId(assignmentId),
            'metadata.studentId': new ObjectId(studentId)
        })
        .sort({ _id: 1 })
        .skip(start)
        .limit(countPerPage)
        .project(projection)

    /*
     * Reassign submission.filename with url to download file instead
     * Turn paginated submissions into an array
     */
    const submissionsArray = await submissions
        .map(submission => {
            submission.filename = `/media/submissions/${submission.filename}`
            return submission
        })
        .toArray()

    // Count the total number of submissions that match the query
    const totalCount = await collection.countDocuments({
        'metadata.assignmentId': new ObjectId(assignmentId),
        'metadata.studentId': new ObjectId(studentId)
    })

    // Compute pagination information
    const page = (Math.floor(start / countPerPage)) + 1
    const totalPages = (Math.ceil(totalCount / countPerPage))
    const links = {}
    if (page < totalPages) {
        links.nextPage = `/assignments/${assignmentId}/submissions?studentId=${studentId}&page=${page + 1}`
        links.lastPage = `/assignments/${assignmentId}/submissions?studentId=${studentId}&page=${totalPages}`
    }
    if (page > 1) {
        links.prevPage = `/assignments/${assignmentId}/submissions?studentId=${studentId}&page=${page - 1}`
        links.firstPage = `/assignments/${assignmentId}/submissions?studentId=${studentId}&page=1`
    }

    const paginatedSubmissions = {
        submissions: submissionsArray,
        pageNumber: page,
        totalPages: totalPages,
        pageSize: countPerPage,
        count: submissionsArray.length,
        totalCount: totalCount,
        links: links
    }
    return paginatedSubmissions
}

exports.updateSubmissionGradeById = async function (submissionId, grade) {
    if (!ObjectId.isValid(submissionId)) {
        throw ('ObjectIdError')
    }
    const db = getDbInstance()
    const collection = db.collection('submissions.files')
    const result = await collection.updateOne(
        { _id: new ObjectId(submissionId) },
        { $set: { "metadata.grade": parseFloat(grade).toFixed(2) } }
    )
    return result.matchedCount > 0
}