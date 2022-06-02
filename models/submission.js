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
                if(result) {
                    const bucket = new GridFSBucket(db, { bucketName: 'submissions'})
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

exports.getSubmissionById = async function(id) {
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