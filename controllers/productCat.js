const productCategoryModel = require("../models/productCatModel")

const addCategory = async (req, res) => {
    try {
        const { name } = req.body
        if(!name)
            return res.status(400).json({ success: false, message: "Please fill in all fields" })
        
        const existingCategory = await productCategoryModel.findOne({ name })
        if(existingCategory)
            return res.status(400).json({ success: false, message: "A category with the same name already exists" })
        
        const newCategory = new productCategoryModel({ name })
        await newCategory.save()
        return res.status(201).json({ success: true, category: newCategory, message: "Category added successfully" })
    } catch (err){
        console.error(err)
        return res.status(500).json({ success: false, message: "Error in add category" })
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
        let { query } = req.query;
        let filter = query ? { name: { $regex: query, $options: "i" } } : {};
        const categories = await productCategoryModel.find(filter).sort({name:1})
        return res.status(200).json({ success: true, categories })
    } catch (err){
        console.error(err)
        return res.status(500).json({ message: "Error in get category" })
    }
}

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params
        const category = await productCategoryModel.findById(id)
        if(!category)
            return res.status(404).json({ success: false, message: "Category not found" })
        return res.status(200).json({ success: true, category })
    } catch (err){
        console.error(err)
        return res.status(500).json({ message: "Error in get brand by id" })
    }
}

const updateCategoryById = async (req, res) => {
    try {
        const { id } = req.params
        const { name } = req.body
        
        if(!name)
            return res.status(400).json({ message: "Please fill in all fields" })
        
        const existingCategory = await productCategoryModel.findOne({ name })
        if(existingCategory && existingCategory._id.toString() !== id)
            return res.status(400).json({ success: false, message: "A category with the same name already exists" })
        
        const updatedCategory = await productCategoryModel.findByIdAndUpdate(id, { name }, { new: true })
        if(!updatedCategory)
            return res.status(404).json({ success: false, message: "Category not found" })
        return res.status(200).json({ success: true, message: "Category updated successfully" })
    } catch (err){
        console.error(err)
        return res.status(500).json({ success: false, message: "Error in update category" })
    }
}

module.exports = {
    addCategory,
    deleteCategory,
    getCategory,
    getCategoryById,
    updateCategoryById
}