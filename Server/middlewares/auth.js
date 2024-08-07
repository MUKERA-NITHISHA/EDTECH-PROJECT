const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

exports.auth = async (req,res,next) => {
    try {
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ", "");
        if(!token) {
            return res.status(400).json({
                success : false,
                message : "Token is missing",
            })
        };

        try {
            const response = await jwt.verify(token,process.env.JWT_SECRET);
            console.log("decode", response);
            req.user = response;
        }
        catch(error){
            return res.status(401).json({
                success : false,
                message : "Invalid Token",
            })

        }
        next();

    }
    catch(error){
        return res.status(401).json({
            success : true,
            message : "Something went wrong while verfying token",
        })

    }
}

exports.isStudent = async (req,res,next) => {
    try {
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success : false,
                message : "This is Protected Route for Students",
            })
        }
        next();

    }
    catch(error) {
        return res.status(500).json({
            success : false,
            message : "Something went wrong while verifying user",
        })
    }
};

exports.isInstructor = async (req,res,next) => {
    try {
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success : false,
                message : "This is Protected Route for Instructors",
            })
        }
        next();

    }
    catch(error) {
        return res.status(500).json({
            success : false,
            message : "Something went wrong while verifying user",
        })
    }
};

exports.isAdmin = async (req,res,next) => {
    try {
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success : false,
                message : "This is Protected Route for Admin",
            })
        }
        next();

    }
    catch(error) {
        return res.status(500).json({
            success : false,
            message : "Something went wrong while verifying user",
        })
    }
}