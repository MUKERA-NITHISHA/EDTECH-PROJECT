const mongoose  = require("mongoose");

const courseSchema = new mongoose.Schema({
    courseName : {
        type:String,
        required : true,
        trim : true,
    },
    courseDescription : {
        type:String,
        required : true,
        trim : true,
    },
    instructor : {
        type : mongoose.Schema.Types.ObjectId,
        ref  : "User",
        required:true,
    },
    whatYouWillLearn : {
        type : String,
        required : true,
        trim : true,
    },
    courseContent : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Section",
        }
    ],
    ratingAndReviews : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "RatingAndReview",
        }
    ],
    price : {
        type : Number,
        trim : true,
        required : true,
    },
    thumbnail : {
        type : String,
    },
    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Category",
    },
    tag : {
        type : [String],
        required : true,
        trim : true,
    },
    studentsEnrolled : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    }],
    instructions : {
        type : [String],
    },
    status : {
        type : String,
        enum : ["Draft", "Published"],
    }
    
});

module.exports = mongoose.model("Course",courseSchema);