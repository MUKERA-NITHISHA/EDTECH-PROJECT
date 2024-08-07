const express = require("express");
const router = express.Router();

// Course Controllers
const {createCourse,getAllCourses,getCourseDetails} = require("../controllers/Course");

// Category Controllers
const {showAllCategory,createCategory, categoryPageDetails} = require("../controllers/Category");

// Section Controllers
const {createSection,updateSection,deleteSection} = require("../controllers/Section");

// Sub Section Controllers
const {createSubSection,updateSubSection,deleteSubSection} = require("../controllers/subSection");

// Rating and Review Controllers
const {createRating, getAverageRating,getAllRating} = require("../controllers/RatingAndReview");

// Middlewares
const {auth,isInstructor, isStudent, isAdmin} = require("../middlewares/auth");

                              // Course Routes

// Create Course
router.post("/createCourse",auth,isInstructor,createCourse);
// Add a Section to a Course
router.post("/addSection",auth,isInstructor,createSection);
// Update Section
router.post("/updateSection",auth,isInstructor,updateSection);
// delete Section
router.post("/deleteSection",auth,isInstructor,deleteSection);
// Update Sub Section
router.post("/updateSubSection",auth,isInstructor,updateSubSection);
// delete Sub Section
router.post("/deleteSubSection",auth,isInstructor,deleteSubSection);
// Add Sub Section
router.post("/addSubSection",auth,isInstructor,createSubSection);
// Get All Registered Courses
router.get("/getAllCourses",getAllCourses);
// Get details for specific course
router.post("/getCourseDetails",getCourseDetails);

                                //   Category Routes
router.post("/createCategory",auth,isAdmin,createCategory);
router.get("/showAllCategories",showAllCategory);
router.post("/getCategoryPageDetails",categoryPageDetails);

                                // Rating and Review
router.post("/createRating",auth,isStudent,createRating);
router.get("/getAverageRating",getAverageRating);
router.get("/getReviews",getAllRating);

module.exports= router;

