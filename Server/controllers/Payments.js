const mongoose = require("mongoose");
const Course = require("../models/Course");
const {instance} = require("../config/razorpay");
const User = require("../models/User");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");


exports.capturePayment = async (req,res) => {
    const {course_id} = req.body;
    const userId = req.user.id;

    if(!course_id){
        return res.json({
            success : false,
            message : 'Please provide valid course ID',
        })
    };

    let course;
    try {
        course  = await Course.findById(course_id);
        if(!course){
            return res.json({
                success : false,
                message : 'Could not find the course',
            })
        }

        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success: false,
                message : 'Student is already enrolled',
            })

        }

    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success : false,
            message : error.message,
        });
    }

    // order create
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount : amount *100,
        currency,
        receipt : Math.random(Date.now()).toString,
        notes : {
            courseId : course_id,
            userId,
        }
    };

    try {
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        return res.status(200).json({
            success : true,
            courseName : course.courseName,
            courseDescription : course.courseDescription,
            thumbnail : course.thumbnail,
            orderId : paymentResponse.id,
            currency : paymentResponse.currency,
            amount : paymentResponse.amount,
        });

    }
    catch(error){
        console.log(error);
        res.json({
            success : false,
            message : "Could not initiate order",
        });

    }
};

exports.verifySignature = async (req,res) => {
    const webhookSecret = "12345678";

    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest) {
        console.log("Payment is Authorised");

        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try{
            const enrolledCourse = await Course.findByIdAndUpdate({_id : courseId}, {$push : {studentsEnrolled: userId}}, {new:true});

            if(!enrolledCourse){
                return res.status(500).json({
                    success : false,
                    message : "Course not found",
                });
            }

            console.log(enrolledCourse);

            const enrolledStudent = await User.findOneAndUpdate({_id:userId}, {$push : {course:courseId}},{new:true});
            console.log(enrolledStudent);

            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congratulations from CodeHelp",
                "Congratulations, you are are onboarded into new CodeHelp Course",
            );

            console.log(emailResponse);
            return res.status(200).json({
                success : true,
                message : "Signature Verified and Course Added",
            })


        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                success : false,
                message : error.message,
            });
        }
    }
    else{
        return res.status(400).json({
            success : false,
            message : "Invalid request",
        })
    }
}