var express = require('express');
var express_graphql = require('express-graphql');
var { buildSchema } = require('graphql');
// import {MongoClient, ObjectId} from 'mongodb'
var mongodb = require('mongodb');
const MONGO_URL = 'mongodb://localhost:27017/college'
var db;
var CourseConnection;
//schema
var schema = buildSchema(`
    type Course {
        _id: String,
        title: String,
        tutor: String,
        description: String,
        topic: String,
        url: String,
    },
    type Query {
        course(_id: String!): Course
        courses: [Course]
    },
    
    type Mutation {
        updateCourse(_id: String, title: String, tutor: String,description: String, topic: String,url: String): Course,
        createCourse(title: String!, tutor: String!,description: String!, topic: String!,url: String!): Course
        
    }
`);
var coursesData = [
    {
        id: 1,
        title: 'The Complete Node.js Developer Course',
        author: 'Andrew Mead, Rob Percival',
        description: 'Learn Node.js by building real-world applications with Node, Express, MongoDB, Mocha, and more!',
        topic: 'Node.js',
        url: 'https://codingthesmartway.com/courses/nodejs/'
    },
    {
        id: 2,
        title: 'Node.js, Express & MongoDB Dev to Deployment',
        author: 'Brad Traversy',
        description: 'Learn by example building & deploying real-world Node.js applications from absolute scratch',
        topic: 'Node.js',
        url: 'https://codingthesmartway.com/courses/nodejs-express-mongodb/'
    },
    {
        id: 3,
        title: 'JavaScript: Understanding The Weird Parts',
        author: 'Anthony Alicea',
        description: 'An advanced JavaScript course for everyone! Scope, closures, prototypes, this, build your own framework, and more.',
        topic: 'JavaScript',
        url: 'https://codingthesmartway.com/courses/understand-javascript/'
    }
];

var getCourse = async function (args) {
    // console.log("=====", args._id);
    return await CourseConnection.findOne(mongodb.ObjectId(args._id));
}

var createCourse = async function (args) {
    const res = await CourseConnection.insert(args);
    console.log('Res: ', res);
    return res['ops'][0];
}
var getCourses = async function () {
    const courses = await CourseConnection.find({}).toArray();
    console.log('Courses: ', courses);
    return courses;
}

var updateCourse = async function (args) {
    // console.log('Args: ', args);
    const course = await CourseConnection.update({"_id": mongodb.ObjectId(args._id)}, { "title": args.title, "tutor": args.tutor, "description" : args.description, "topic": args.topic, "url": args.url });
    return await CourseConnection.findOne(mongodb.ObjectId(args._id));
}

//resolver

var root = {
    course: getCourse,
    courses: getCourses,
    createCourse: createCourse,
    updateCourse: updateCourse
};

var app = express();

app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));



start = async () => {
    try {
        db = await mongodb.MongoClient.connect(MONGO_URL)
        CourseConnection = db.collection('course')
        app.listen(4000, () => {
            console.log('Graphql server is running on http://localhost:4000/graphql')
        });
    } catch (e) {
        console.log('Exception: ', e);
    }
}

start();