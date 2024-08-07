const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

exports.resetPasswordToken = async (req,res) => {
    try {
        const {email} = req.body;
        let user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success : false,
                message : "User Does not Exists"
            });
        }

        // const token  = crypto.randomUUID();
        const token = crypto.randomBytes(20).toString("hex");
        const updatedDetails  = await User.findOneAndUpdate({email:email}, {
            token : token,
            ressetPasswordExpires : Date.now() + 3600000,
        },{new:true}) ;

        const url = `http://localhost:3000/update-password/${token}`;
        await mailSender(email,"Password Reset Link", `Click on the Link: ${url}`);
        return res.status(200).json({
            success: true,
            message : "Mail Sent Successfully",
        })

    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Something went Wrong while Sending password reset mail",
        });

    }
}

exports.resetPassword = async (req,res) => {
    try {
        const {password, confirmPassword,token} = req.body ;

        if(password!==confirmPassword){
            return res.status(400).json({
                success : false,
                message : "Password Mismatch",
            })
        }

        const user = await User.findOne({token : token });

        if(!user){
            return res.status(401).json({
                success : false,
                message : "Token invalid",
            })
        };

        if(!(user.ressetPasswordExpires > Date.now())){
            return res.status(400).json({
                success : false,
                message : "Token Expired Please Regenarate your token again",
            })
        }

        const hashPassword = await bcrypt.hash(password,10);

        const updatedUser = await User.findOneAndUpdate({token:token}, {
            password:hashPassword,
        },{new:true,});

        res.status(200).json({
            success:true,
            message : "Password Reset Successfully",
        })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Something went Wrong While reseting the password Try Again Later",
        })
    }
}