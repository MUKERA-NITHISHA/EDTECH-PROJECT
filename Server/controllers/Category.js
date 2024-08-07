const Category = require("../models/category");

exports.createCategory = async (req,res) => {
    try{

        const {name,description} = req.body;

        if(!name){
            return res.status(400).json({
                success : false,
                message : "Enter All the details",
            })
        }

        const categoryDetails = await Category.create({
            name,description,
        });
        res.status(200).json({
            success:true,
            message : "Category Created Successfully",
            categoryDetails,
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success :false,
            message : "Something went wrong while creating Tag"
        })
    }
}

exports.showAllCategory = async (req,res) => {
    try {

        const allCategories = await Category.find({}, {name:true,description:true});
        res.status(200).json({
            success : true,
            message : "All Tags extracted Successfully",
            data : allCategories,
        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message : message.error,
        })

    }
};

exports.categoryPageDetails = async (req,res) => {
    try {
        const {categoryId} = req.body;

        const selectedCategory = await Category.findById(categoryId).populate("course").exec();

        if(!selectedCategory){
            return res.status(404).json({
                success : true,
                message : "Category Not Found",
            })
        }

        if(selectedCategory.course.length === 0){
            return res.status(404).json({
                success :false,
                message : "No courses found for selected Category",
            })
        }

        const selectedCourses = selectedCategory.course;

        const categoriesExceptSelected = await Category.find({_id : {$ne : categoryId}}).populate("courses");
        let differentCourses = []
        for(const category of categoriesExceptSelected){
            differentCourses.push(...category.course);
        }

        const allCategories = await Category.find().populate("courses");
        const allCourses = allCategories.flatMap((category) => category.course);
        const mostSellingCourses = allCourses.sort((a,b) => b.sold - a.sold).slice(0,10);

        res.status(200).json({
            selectedCourses : selectedCourses,
            differentCourses : differentCourses,
            mostSellingCourses : mostSellingCourses
        })

    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Internal Server Error",
        });
    }
};