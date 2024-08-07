const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();


exports.createSubSection = async (req, res) => {
    try {
        const { sectionId, title, timeDuration, description } = req.body;

        const video = req.files.videoFile;

        if (!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(200).json({
                success: false,
                message: "Enter all the details",
            })
        }

        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: `${uploadDetails.duration}`,
            description: description,
            videoUrl: uploadDetails.secure_url,
        })
        // console.log("Sub Section Details", subSectionDetails);

        const updatedSection = await Section.findByIdAndUpdate({_id: sectionId}, {
            $push: {
                subSection: subSectionDetails._id,
            }
        }, { new: true }).populate("subSection").exec();

        return res.status(200).json({
            success: true,
            message: "Sub Section Created Succesfully",
            updatedSection,
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Enable to create SubSection Try again later",
        })

    }
}

exports.updateSubSection = async (req, res) => {
    try {

        const { SubsectionId, title, description } = req.body;
        const subSection = await SubSection.findById(SubsectionId);

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            })
        }

        if (title !== undefined) {
            subSection.title = title
        }

        if (description !== undefined) {
            subSection.description = description
        }

        if (req.files && req.files.videoFile !== undefined) {
            const video = req.files.videoFile;
            const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
            subSection.videoUrl = uploadDetails.secure_url;
            subSection.timeDuration = `${uploadDetails.duration}`;
        }

        await subSection.save()

        return res.json({
            success: true,
            message: "Section updated successfully",
        })

    }
    catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the section",
        })

    }
}

exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body;

        await Section.findByIdAndUpdate({_id : sectionId},
            {
                $pull : {
                    subSection : subSectionId,
                }
            }
        )

        const subSection = await SubSection.findByIdAndDelete(subSectionId);

        if(!subSection){
            return res.status(404).json({
                success:false,
                message : "SubSection not found",
            })
        }
        return res.status(200).json({
            success: true,
            message: "Sub Section deleted Successfully",
        })

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Enable to delete Sub Section Try Again later",
        })

    }
}