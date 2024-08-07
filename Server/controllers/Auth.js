const OTP = require("../models/OTP");
const User = require("../models/User");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
require("dotenv").config();
const Profile = require("../models/Profile");

exports.sendotp = async (req,res) => {
    try{
        const {email} = req.body;

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(401).json({
                success : false,
                message : "User Already Registered",
            })
        }
        
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets : false,
            lowerCaseAlphabets : false,
            specialChars : false,
        });
        console.log("OTP ",otp);

        let response = await OTP.findOne({otp : otp});

        while(response){
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets : false,
                lowerCaseAlphabets : false,
                specialChars : false,
            });
            // response = await OTP.findOne({otp : otp});
        }

        let otpPayload = await OTP.create({email,otp});
        console.log("OTP",otpPayload)

        res.status(200).json({
            success : true,
            message : "OTP Sent Successfully",
            otp,
        })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : true,
            message : error.message,
        })

    }
};

exports.signup = async (req,res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            otp,
        } = req.body;

        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(401).json({
                success : false,
                message : "Enter All the details!",
            })
        };

        if(password!==confirmPassword){
            return res.status(400).json({
                success : false,
                message : "Password and Confirm Password mismatch",
            })
        };

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success : false,
                message : "User Already Exists"
            })
        };

        let recentOtp = await OTP.findOne({email}).sort({createdAt : -1}).limit(1);
        console.log("OTP",otp)
        console.log("Response",recentOtp);
        console.log(recentOtp.otp);
        if(!recentOtp){
            return res.status(400).json({
                success : false,
                message : "OTP Not Found",
            })
        }
        else if(recentOtp.otp !== otp){
            return res.status(401).json({
                success : false,
                message : "Invalid OTP",
            })
        };

        let hashPassword = await bcrypt.hash(password,10);

        // Create the user
		let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);
        // console.log("HashPassword", hashPassword);

        let otherDetails = await Profile.create({
            gender : null,
            dateOfBirth : null,
            about : null,
            contactNumber : null,
        });

        let user = await User.create({
            firstName,
            lastName,
            email,
            password : hashPassword,
            accountType,
            additionalDetails : otherDetails._id,
            image : `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })
        
        
        return res.status(200).json({
            success : true,
            message : "User Signed in Successfully",
            user,
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message : "User cannot be registered Try Again Later",
        });
    }
}

exports.login = async (req,res) => {
    try{
        const {email,password} = req.body;
        
        if(!email || !password){
            return res.status(400).json({
                success : false,
                message : "Enter All the Details",
            });
        } 

        const user  = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success : false,
                message : "User Not Exists",
            })
        }

        if(await bcrypt.compare(password,user.password)){
            const payload = {
                email : user.email,
                id : user._id,
                accountType : user.accountType,
            };
            const token =  jwt.sign(payload,process.env.JWT_SECRET, {
                expiresIn : "2h"
            });

            // user = user.toObject();
            user.token = token;
            user.password = undefined;

            let options = {
                expires : new Date(Date.now() + 3*24*60*60*1000),
                httpOnly : true,
            }

            res.cookie("token", token,options).status(200).json({
                success : true,
                token,
                user,
                message : "Logged In Successfully.."
            });
        }
        else{
            return res.status(401).json({
                success : false,
                message : "Incorrect Password",
            })
        }

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "User Not Logged In Try Again Later"
        })

    }
}

exports.changePassword = async (req,res) => {
    try{

        const userId = req.user.id;

        const userDetails = await User.findById(userId);

        const {oldPassword, newPassword, confirmPassword} = req.body;

        const isPassword = await bcrypt.compare(oldPassword,userDetails.password);

        if(!isPassword){
            return res.status(400).json({
                success : false,
                message : "The password is incorrect",
            })
        }

        if(newPassword !== confirmPassword){
            return res.status(400).json({
                success : false,
                message : "Password mismatch",
            })
        };

        const hashPassword = await bcrypt.hash(newPassword,10);
        const updateDetails = await User.findByIdAndUpdate({_id: userId}, {password:hashPassword},{new:true});

        // send Notification email
        try {
            const emailResponse = await mailSender(updateDetails.email,
                passwordUpdated(updateDetails.email,
                    `Password updated successfully for ${updateDetails.firstName} ${updateDetails.lastName}`
                )
            );
            console.log("Email Response:", emailResponse.response);
        }
        catch(error){
            return res.status(500).json({
                success:false,
                message : "Error occured while sending mail",
                error : error.message,
            })

        }
        return res.status(200).json({
            success:true,
            message : "Password Updated Successfully",
        })

    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Error occured while Updating Password",
            error : error.message,
        })

    }
};
