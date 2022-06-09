const { ObjectId } = require("mongodb");
const { getDbInstance } = require("../lib/mongo");
const { extractValidFields } = require("../lib/validation");
const { getUserById } = require("./user");

const courseSchema = {
  subject: { required: true },
  number: { required: true },
  title: { required: true },
  term: { required: true },
  instructorId: { required: true },
  students: { require: false },
};
exports.courseSchema = courseSchema;

exports.insertNewCourse = async function insertNewCourse(newCourse) {
  const db = getDbInstance();
  const collection = db.collection("courses");
  course = extractValidFields(newCourse, courseSchema);
  const result = await collection.insertOne(course);
  return result.insertedId;
};

exports.getAllCourses = async function getAllCourses() {
  const db = getDbInstance();
  const collection = db.collection("courses");
  const courses = await collection.find().toArray();
  return courses;
};

async function getCourseById(courseId) {
  const db = getDbInstance();
  const collection = db.collection("courses");
  try {
    const course = await collection
      .aggregate([{ $match: { _id: new ObjectId(courseId) } }])
      .toArray();
    return course[0];
  } catch (e) {
    return null;
  }
}
exports.getCourseById = getCourseById;

exports.updateCourseById = async function updateCourseById(courseId, course) {
  const courseValues = {
    subject: course.subject,
    number: course.number,
    title: course.title,
    term: course.term,
    instructorId: course.instructorId,
  };
  const db = getDbInstance();
  const collection = db.collection("courses");
  try {
    const result = await collection.replaceOne(
      { _id: new ObjectId(courseId) },
      courseValues
    );
    return result.matchedCount > 0;
  } catch (e) {
    return null;
  }
};

exports.getCorrectData = async function getCorrectData(data) {
  for (var i = 0; i < data.length; i++) {
    temp = {
      subject: data[i].subject,
      number: data[i].number,
      title: data[i].title,
      term: data[i].term,
      instructorId: data[i].instructorId,
    };
    data[i] = temp;
  }
  return data;
};

exports.getSubjectData = async function getSubjectData(subject) {
  const db = getDbInstance();
  const collection = db.collection("courses");
  const courses = await collection.find({ subject: subject }).toArray();
  for (var i = 0; i < courses.length; i++) {
    temp = {
      subject: courses[i].subject,
      number: courses[i].number,
      title: courses[i].title,
      term: courses[i].term,
      instructorId: courses[i].instructorId,
    };
    courses[i] = temp;
  }
  return courses;
};

exports.getNumberData = async function getNumberData(number) {
  const db = getDbInstance();
  const collection = db.collection("courses");
  const courses = await collection.find({ number: number }).toArray();
  for (var i = 0; i < courses.length; i++) {
    temp = {
      subject: courses[i].subject,
      number: courses[i].number,
      title: courses[i].title,
      term: courses[i].term,
      instructorId: courses[i].instructorId,
    };
    courses[i] = temp;
  }
  return courses;
};

exports.getTermData = async function getTermData(term) {
  const db = getDbInstance();
  const collection = db.collection("courses");
  const courses = await collection.find({ term: term }).toArray();
  for (var i = 0; i < courses.length; i++) {
    temp = {
      subject: courses[i].subject,
      number: courses[i].number,
      title: courses[i].title,
      term: courses[i].term,
      instructorId: courses[i].instructorId,
    };
    courses[i] = temp;
  }
  return courses;
};
exports.deleteCoursesById = async function deleteCoursesById(id) {
  const db = getDbInstance();
  const collection = db.collection("courses");
  const count = await collection.deleteOne({ _id: new ObjectId(id) });
  console.log(count);
  return count.deletedCount > 0;
};

exports.getAssignmentsByCourseId = async function getAssignmentsByCourseId(id) {
  const db = getDbInstance();
  const collection = db.collection("assignments");
  const assignments = await collection
    .aggregate([{ $match: { courseId: new ObjectId(id) } }])
    .toArray();
  return assignments;
};

exports.courseEnrollment = async function courseEnrollment(id, body) {
  const db = getDbInstance();
  const userCollection = db.collection("users");
  // get classes info for inserting into user table
  const classes = await getCourseById(id);
  // insert into user table
  console.log(body.add.length);
  var enroll;
  var result = [];
  if(body.add){
    for (let i = 0; i < body.add.length; i++) {
      enroll = await userCollection.updateOne(
        { _id: new ObjectId(body.add[i]) },
        {
          $addToSet: {
            courses: classes._id
          },
        }
      );
      console.log(enroll);
      if (enroll.modifiedCount == 0) {
        result.push(body.add[i]);
      }
    }
  }
  var remove;
  if(body.remove) {
    for (let i = 0; i < body.add.length; i++) {
      remove = await userCollection.updateOne(
        { _id: new ObjectId(body.remove[i]) },
        {
          $pull: {
            courses: classes._id,
          },
        }
      );
    }
  }
  return result;
};

exports.getListStudentInCourse = async function getListStudentInCourse(id) { 
  const db = getDbInstance();
  const collection =  db.collection("users");
  const users = await collection
    .find({ role: "student", courses: ObjectId(id) })
    .project({ courses: 0 });
  return users.toArray();
};

exports.getInstructorId = async function getInstructorId(courseId) {
    const course = await getCourseById(courseId)
    return course.instructorId
}

exports.bulkInsertNewCourses = async function bulkInsertNewCourses(courses) {
    const coursesToInsert = courses.map(course => {
        course._id = new ObjectId(course._id.$oid)
        course.instructorId = new ObjectId(course.instructorId)
        return course
    })
    const db = getDbInstance()
    const collection = db.collection('courses')
    const result = await collection.insertMany(coursesToInsert)
    return result.insertedIds
}

exports.getProcessedStudentInfo = function(data){
  var csv = "ID,name,email\n";
  for(var i = 0;i<data.length;i++){
      csv += data[i].id + "," + data[i].name + "," + data[i].email + "\n";
  }
  return csv;
};