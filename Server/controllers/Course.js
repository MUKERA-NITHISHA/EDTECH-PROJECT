const Category = require("../models/category");
const Course = require("../models/Course");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

exports.createCourse = async (req,res) => {
    try {
        let {courseName, courseDescription,  whatYouWillLearn, price,category,tag,status,instructions} = req.body;

        const thumbnail = req.files.thumbnailImage;

        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !thumbnail || !category || !tag){
            return res.status(400).json({
                success : false,
                message : "Enter All the details",
            })
        }

        if(!status || !status === undefined) {
            status = "Draft";
        }

        const userId = req.user.id;
        const instructorDetails = await User.findById(userId,{accountType : "Instructor"});
        console.log("InstructorDetails",instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success : false,
                message : "Instructor Details Not Found",
            })
        }

        const categoryDetails = await Category.findById(category);
        if(!categoryDetails){
            return res.status(404).json({
                success : false,
                message : "Category Details Not Found",
            })
        }

        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor : instructorDetails._id,
            whatYouWillLearn,
            price,
            tag : tag,
            thumbnail : thumbnailImage.secure_url,
            category : categoryDetails._id,
            status : status,
            instructions : instructions,
        })

        const updatedUser = await User.findByIdAndUpdate({_id : instructorDetails._id}, {
            $push : {
                courses : newCourse._id,
            }
        }, {new:true});

        const updatedCategory = await Category.findByIdAndUpdate({_id: categoryDetails._id}, {
            $push : {
                course : newCourse._id,
            }
        },{new : true});

        res.status(200).json({
            success : true,
            message : "Course Created Successfully",
            data:newCourse,
        })
    }
    catch(error) {
        return res.status(500).json({
            success : false,
            message : "Failed to create Course",
            error : error.message,
        })
    }
};

exports.getAllCourses = async (req,res) => {
    try{
        const allCourses = await Course.find({},{
            courseName : true,
            price : true,
            thumbnail : true,
            instructor : true,
            ratingAndReviews : true,
            studentsEnrolled : true,
        }).populate("instructor").exec();
        res.status(200).json({
            success:true,
            message : "Courses Fetched Successfully..",
            data : allCourses,
        })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Enable to fetch courses",
            error : error.message,
        })
    }
}

exports.getCourseDetails = async (req,res) => {
    try{
        const {courseId} = req.body;

        const courseDetails = await Course.find(
                                    {_id:courseId})
                                    .populate(
                                        {
                                            path:"instructor",
                                            populate : {
                                                path : "additionalDetails",
                                            },
                                        }
                                    )
                                    .populate("category")
                                    // .populate("ratingAndReviews")
                                    .populate(
                                        {
                                            path : "courseContent",
                                            populate: {
                                                path: "subSection",
                                            },
                                        }
                                    )
                                    .exec();
        if(!courseDetails){
            return res.status(400).json({
                success : false,
                message : `Could not Find the course with ${courseId}`,
            });
        }

        return res.status(200).json({
            success : true,
            message : "Course Details fetched successfully",
            data : courseDetails,
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : error.message,
        })

    }
}