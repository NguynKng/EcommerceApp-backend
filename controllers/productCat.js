const productCategoryModel = require("../models/productCatModel")

const addCategory = async (req, res) => {
    try {
        const { name } = req.body
        if(!name)
            return res.status(400).json({ message: "Please fill in all fields" })
        
        const existingCategory = await productCategoryModel.findOne({ name })
        if(existingCategory)
            return res.status(400).json({ message: "A category with the same name already exists" })
        
        const newCategory = new productCategoryModel({ name })
        await newCategory.save()
        return res.status(201).json({ success: true, category: newCategory })
    } catch (err){
        console.error(err)
        return res.status(500).json({ message: "Error in add category" })
    }
}

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params
        
        const category = await productCategoryModel.findByIdAndDelete(id)
        if(!category)
            return res.status(404).json({ message: "Category not found" })
        return res.status(200).json({ success: true, message: "Category deleted successfully" })
    } catch (err){
        console.error(err)
        return res.status(500).json({ message: "Error in delete category" })
    }
}

const getCategory = async (req, res) => {
    try {        
        const category = await productCategoryModel.find(req.query)
        return res.status(200).json({ success: true, category })
    } catch (err){
        console.error(err)
        return res.status(500).json({ message: "Error in get category" })
    }
}

module.exports = {
    addCategory,
    deleteCategory,
    getCategory
}