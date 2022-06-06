/*
 * This file contains a simple script to populate the database with initial
 * data from the files in the data/ directory.  The following environment
 * variables must be set to run this script:
 *
 *   MONGO_DB_NAME - The name of the database into which to insert data.
 *   MONGO_USER - The user to use to connect to the MongoDB server.
 *   MONGO_PASSWORD - The password for the specified user.
 *   MONGO_AUTH_DB_NAME - The database where the credentials are stored for
 *     the specified user.
 *
 * In addition, you may set the following environment variables to create a
 * new user with permissions on the database specified in MONGO_DB_NAME:
 *
 *   MONGO_CREATE_USER - The name of the user to create.
 *   MONGO_CREATE_PASSWORD - The password for the user.
 */

const { connectToDb, getDbInstance, closeDbConnection } = require('./lib/mongo')

const assignmentsData = require('./data/assignments (_id included).json')
const coursesData = require('./data/courses (_id included).json')
const submissionsData = require('./data/submissions (_id included).json')
const usersData = require('./data/users (_id included).json')
const { bulkInsertNewAssignments } = require('./models/assignment')
const { bulkInsertNewCourses } = require('./models/course')
const { bulkInsertNewUsers } = require('./models/user')

const mongoCreateUser = process.env.MONGO_CREATE_USER
const mongoCreatePassword = process.env.MONGO_CREATE_PASSWORD

connectToDb(async function () {
    /*
     * Insert initial data into the database
     */
    const assignmentIds = await bulkInsertNewAssignments(assignmentsData)
    const courseIds = await bulkInsertNewCourses(coursesData)
    const userIds = await bulkInsertNewUsers(usersData)
    // console.log(assignmentsData)
    // console.log(coursesData)
    console.log(submissionsData)
    // console.log(usersData)
    console.log("== Inserted assignments with IDs:", assignmentIds)
    console.log("== Inserted courses with IDs:", courseIds)
    console.log("== Inserted users with IDs:", userIds)

    /*
     * Create a new, lower-privileged database user if the correct environment
     * variables were specified.
     */
    if (mongoCreateUser && mongoCreatePassword) {
        const db = getDbInstance()
        const result = await db.addUser(mongoCreateUser, mongoCreatePassword, {
            roles: "readWrite"
        })
        console.log("== New user created:", result)
    }

    closeDbConnection(function () {
        console.log("== DB connection closed")
    })
})
