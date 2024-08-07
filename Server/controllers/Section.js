const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req,res) => {
    try {
        const {sectionName,courseId} = req.body;

        if(!sectionName || !courseId){
            return res.status(400).json({
                success : false,
                message : "Enter All the details",
            })
        };

        const section = await Section.create({sectionName});
        // console.log("Section ", section);

		const updatedDetails = await Course.findByIdAndUpdate(
			courseId,
			{
				$push: {
					courseContent: section._id,
				},
			},
			{ new: true }
		)
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();
        // console.log("UpdatedUserDetails", updatedDetails);

        res.status(200).json({
            success : true,
            message : "Section created Successfully..."
        })

    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Internal Server Error while creating Section",
            error : error.message,
        })

    }
}

exports.updateSection = async (req,res) => {
    try {
        const {sectionName,sectionId} = req.body;
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success : false,
                message : "Entire all the details",
            })
        }

        const section  = await Section.findById(sectionId);
        console.log("Section Details",section)
        const updatedSection = await Section.findByIdAndUpdate(sectionId,{sectionName},{new :true});
        console.log("Updated Section",updatedSection);

        res.status(200).json({
            success : true,
            message : "Section Updated Successfully",
        });
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Error while updating Section",
        })

    }
}

exports.deleteSection = async (req,res) => {
    try {
        const {sectionId} = req.body;
        await Section.findByIdAndDelete(sectionId);
        //TODO[Testing]: do we need to delete the entry from the course schema ??
        res.status(200).json({
            success : true,
            message : "Section deleted Successfully",
        })

    }
    catch(error){
        return res.status(500).json({
            success : false,
            message: "Enable to delete section please try again",
        })

    }
}