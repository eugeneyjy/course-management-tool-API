const { Router } = require('express')
const { requireAuthentication, isUserAdmin } = require('../lib/auth')

// const { } = require('../lib/validation')
// const {} = require('../models/course')
const { validateAgainstSchema } = require('../lib/validation')
const { courseSchema, insertNewCourse, getCourseById, updateCourseById, getAllCourses, getCorrectData, 
    getSubjectData, getNumberData, getTermData, getAssignmentsByCourseId, deleteCoursesById, 
    courseEnrollment, getListStudentInCourse } = require('../models/course')


const router = Router()

// Fetch the list of all courses.
router.get('/', async function (req, res, next) {
    const courses = await getAllCourses();
    let page = parseInt(req.query.page) || 1;
    let subject = req.query.subject;
    let number = req.query.number;
    let term = req.query.term;
    const numPerPage = 10;
    const lastPage = Math.ceil(courses.length / numPerPage);
    page = page > lastPage ? lastPage : page;
    page = page < 1 ? 1 : page;
    const start = (page - 1) * numPerPage;
    const end = start + numPerPage;
    let pageCourses = await getCorrectData(courses.slice(start, end));
    const links = {};
    if (page < lastPage) {
        links.nextPage = `/courses?page=${page + 1}`;
        links.lastPage = `/courses?page=${lastPage}`;
    }
    if (page > 1) {
        links.prevPage = `/courses?page=${page - 1}`;
        links.firstPage = `/courses?page=1`;
    }
    if(subject) {
        pageCourses = await getSubjectData(subject);
    }
    if(number) {
        pageCourses = await getNumberData(number);
    }
    if(term) {
        pageCourses = await getTermData(term);
    }
    res.status(200).json({
        courses: pageCourses,
        pageNumber: page,
        totalPages: lastPage,
        pageSize: numPerPage,
        totalCount: courses.length,
        links: links
    })
})

// Create a new course.
router.post('/', requireAuthentication, async function (req, res, next) {
    const admin = await isUserAdmin(req.userId)
    if (admin) {
        if (validateAgainstSchema(req.body, courseSchema)) {
            const id = await insertNewCourse(req.body)
            res.status(201).send({
                id: id
            })
        }
        else {
            res.status(400).send({
                error: "The request body was either not present or did not contain a course object"
            })
        }
    }
    else{
        res.status(403).send({
            error: "The request was not made by an admin"
        })
    }
})

// Fetch data about a specific Course.
router.get('/:courseId', async function (req, res, next) {
    const course = await getCourseById(req.params.courseId)
    if (course) {
        res.status(200).send({
            subject: course.subject,
            number: course.number,
            title: course.title,
            term: course.term,
            instructorId: course.instructorId
        })
    }
    else {
        res.status(404).send({
            error: "Specified courseId not found."
        })
    }
})

// Update data for a specific Course.
router.patch('/:courseId', requireAuthentication, async function (req, res, next) {
    const course = await getCourseById(req.params.courseId)
    if (course === null) {
        res.status(404).json({
            error: "Specified courseId not found."
        })
    }
    const admin = await isUserAdmin(req.userId)
    if (admin || course.instructorId == req.userId){
        if (validateAgainstSchema(req.body, courseSchema)) {
            const updateSuccessful = await updateCourseById(req.params.courseId, req.body)
            if (updateSuccessful) {
                res.status(200).send()
            }
            else {
                next()
            }
        }
        else {
            res.status(400).json({
                error: "Request body is not a valid course object"
            })
        }
    }
    else {
        res.status(403).send({
            error: "The request was not made by an admin or the instructor of the course"
        })
    }
})

// Remove a specific Course from the database.
router.delete('/:courseId', requireAuthentication, async function (req, res, next) {
    const admin = await isUserAdmin(req.userId)
    if(admin) {
        const count = await deleteCoursesById(req.params.courseId)
        if(count) {
            res.status(204).end();
        }
        else {
            next();
        }
    }
    else {
        res.status(403).send({
            error: "The request was not made by an admin"
        })
    }
})

// Fetch a list of the students enrolled in the Course.
router.get('/:courseId/students', async function (req, res, next) {
    const course = await getListStudentInCourse(req.params.courseId)
    if (course) {
        res.status(200).send({
            student: course
        })
    }
    else {
        res.status(404).send({
            error: "Specified courseId not found."
        })
    }
})

// Enrollment for a Course.
// body: studentId
router.post('/:courseId/students', async function (req, res, next) {
    try {
        const result = await courseEnrollment(req.params.courseId, req.body);
        if(result.length == 0) {
            res.status(200).send({
                msg: `Enrolled sucessfully`
            })
        }
        else if(result.length != 0) {
            res.status(400).send({
                error: "User " + result + " trying to enroll the same course"
            })
        }
    }catch(err) {
        throw err
    }
})

// Fetch a CSV file containing list of the students enrolled in the Course.
router.get('/:courseId/roster', requireAuthentication, function (req, res, next) {
    res.status(201).send({
        msg: `REQUEST RECEIVED`
    })
})

// Fetch a list of the Assignments for the Course.
router.get('/:courseId/assignments', async function (req, res, next) {
    const courseId = req.params.courseId
    const assignments = await getAssignmentsByCourseId(courseId)
    //if statment technically wrong cause there could be a class but no assignments yet
    if(assignments.length > 0) {
        for(var i = 0; i < assignments.length; i++) {
            newData = {
                courseId: assignments[i].courseId,
                title: assignments[i].title,
                points: assignments[i].points,
                due: assignments[i].due
            }
            assignments[i] = newData
        }
        res.status(200).json({
            assignments: assignments
        })
    } else {
        res.status(404).send({
            error: "Specified courseId not found."
        })
    }
})



























module.exports = router;