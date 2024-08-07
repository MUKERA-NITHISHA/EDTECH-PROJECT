const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

exports.createRating = async (req,res) => {
    try{
        const userId = req.user.id;
        const {rating, review,courseId} = req.body;

        const courseDetails = await Course.find({
                                    _id: courseId,
                                    studentsEnrolled : {$eleMatch : {$eq : userId}},});
        
        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message : "Student Not enrolled in the course",
            })
        }

        const alreadyReviewed = await RatingAndReview.findOne({user:userId, course:courseId});

        if(alreadyReviewed){
            return res.status(403).json({
                success : false,
                message : "Course is already Reviewed by the user",
            })
        }

        const ratingReview = await RatingAndReview.create({
            user:userId,rating,review,course:courseId
        });

        const userDetails = await Course.findByIdAndUpdate({_id:courseId},
            {
                $push : {ratingAndReviews: ratingReview._id}
            },{new:true},
        )

        return res.status(200).json({
            success : true,
            message : "Rating and Reviews created Successfull",
            ratingReview,
        })

    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Rating and review not created",
            error : error.message,
        })

    }
}

exports.getAverageRating = async (req,res) => {
    try {
        const {courseId} = req.body;

        const result = await RatingAndReview.aggregate([
            {
                $match : {
                    course : new mongoose.Types.ObjectId(courseId),
                }
            },
            {
                $group : {
                    _id : null,
                    averageRating : {$avg : "$rating"},
                }
            }
        ])

        if(result.length > 0){
            return res.status(200).json({
                success : true,
                averageRating : result[0].averageRating,
            })
        }

        return res.status(200).json({
            success : true,
            message : "Average rating is  0 No, rating given till now",
            averageRating : 0,
        })
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : error.message,
        })

    }
}

exports.getAllRating = async (req,res) => {
    try{
        const allReview = await RatingAndReview.find({}).sort({rating : "desc"})
                                               .populate(
                                                {
                                                    path : "user",
                                                    select : "firstName, lastName,image,email"
                                                }
                                               )
                                               .populate(
                                                {
                                                    path : "course",
                                                    select : "courseName",
                                                }
                                               ).exec();
        return res.status(200).json({
            success : true,
            message : "All reviews fetched Successfully",
            data : allReview,
        })

    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Review not fetched",
            error : error.message,
        })

    }
}