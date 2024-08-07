const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");
require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        trim : true,
    },
    otp : {
        type : String,
        required : true,
    },
    createdAt : {
        type : Date,
        default : Date.now(),
        expires : 5*60,
    },
});

async function sendVerificationEmail(email,otp) {
    try {
        const mailResponse = await mailSender(email,"Verification Email from StudyNotion", emailTemplate(otp));
        console.log("Email Sent Successfully: ",mailResponse.response);

    }
    catch(error){
        console.log("Error occured while sending mails: ",error);
        throw error;

    }
}

OTPSchema.pre("save", async function(next)  {
    if(this.isNew){
        await sendVerificationEmail(this.email,this.otp);
    }
    next();
})



const OTP = mongoose.model("OTP" ,OTPSchema);
module.exports = OTP;