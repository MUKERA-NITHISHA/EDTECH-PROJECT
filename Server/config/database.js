const mongoose = require("mongoose");
require("dotenv").config();

const dbconnect = () => {
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser : true,
        useUnifiedTopology : true,
    })
    .then(() => console.log("DB Connection Successfull"))
    .catch((error) => {
        console.log("DB Connection Failed");
        console.error(error);
        process.exit(1);

    })
};

module.exports = dbconnect;