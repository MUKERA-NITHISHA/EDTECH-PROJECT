const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
require("dotenv").config();

exports.updateProfile = async(req,res) => {
    try {
        const {dateOfBirth="", about="", contactNumber, gender} = req.body;
        

        if(!contactNumber || !gender){
            return res.status(400).json({
                success :false,
                message : "Enter All the details",
            })
        }

        const user_id = req.user.id;
        const userDetails = await User.findById(user_id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        // console.log("User Details",userDetails);
        // console.log("Profile Details", profileDetails);

        profileDetails.dateOfBirth = dateOfBirth,
        profileDetails.about = about,
        profileDetails.contactNumber = contactNumber,
        profileDetails.gender = gender,
        // console.log("Profile Details");
        // console.log(profileDetails);

        await profileDetails.save();

        return res.status(200).json({
            success : true,
            message : "Profile updated Successfully",
            profileDetails,
        })
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Enable to update Profile, Try Again later",
        })

    }
}


//deleteAccount
//Explore -> how can we schedule this deletion operation
exports.deleteAccount = async (req,res) => {
    try {

        const id = req.user.id;
        const user = await User.findById(id);
        if(!user){
            return res.status(404).json({
                success : false,
                message : "User not found",
            })
        }
        await Profile.findByIdAndDelete(user.additionalDetails);
        //TOOD: HW unenroll user form all enrolled courses

        async function unEnrollUser(course){
            await Course.findByIdAndDelete({_id: course}, {
                $pull : {
                    studentsEnrolled : id,
                }
            })
        }

        for(const course of user.courses) {
            await unEnrollUser(course);
        }

        await User.findByIdAndDelete({_id:id});
        res.status(200).json({
            success : true,
            message : 'User deleted Successfully',
        })

    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "User could not deleted Successfully",
        })

    }
}

exports.getAllUserDetails = async (req,res) => {
    try {

        const id = req.user.id;

        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        res.status(200).json({
            success : true,
            message : "User Data fetched Successfully",
            data : userDetails,
        })

    }
    catch(error) {
        return res.status(500).json({
            success : false,
            message : error.message,
        })

    }
}

exports.updateDisplayPicture = async (req,res) => {
    try{
        const displayPicture = req.files.displayPicture;
        const userId = req.user.id;

        const image = await uploadImageToCloudinary(displayPicture,process.env.FOLDER_NAME,1000,1000);

        const updateProfile = await User.findByIdAndUpdate(
            {_id : userId},
            {image : image.secure_url},
            {new:true},
        )

        res.status(200).json({
            success : true,
            message : "Image Updated Successfully",
            data : updateProfile,
        })

    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : error.message,
        })

    }
}

exports.getEnrolledCourses = async (req,res) => {
    try{
        const userId = req.user.id;
        const userDetails = await User.findOne({_id:userId}).populate("courses").exec();
        if(!userDetails){
            return res.status(400).json({
                success : false,
                message : `Could not find user with id: ${userId}`,
            })
        }
        return res.status(200).json({
            success : true,
            message : userDetails.courses,
        })

    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : error.message,
        })
    }
}