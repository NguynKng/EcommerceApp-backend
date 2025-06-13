const brandModel = require("../models/brandModel")
const productModel = require("../models/productModel")

const addBrand = async (req, res) => {
    try {
        const { name } = req.body
        if(!name)
            return res.status(400).json({ message: "Please fill in all fields" })
        
        const existingBrand = await brandModel.findOne({ name })
        if(existingBrand)
            return res.status(400).json({ message: "A brand with the same name already exists" })
        
        const newBrand = new brandModel({ name })
        await newBrand.save()
        return res.status(201).json({ success: true, message: "Add brand successfully." })
    } catch (err){
        console.error(err)
        return res.status(500).json({ message: "Error in add brand" })
    }
}

const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params
        
        const brand = await brandModel.findByIdAndDelete(id)
        if(!brand)
            return res.status(404).json({ message: "Brand not found" })
        return res.status(200).json({ success: true, message: "Brand deleted successfully" })
    } catch (err){
        console.error(err)
        return res.status(500).json({ message: "Error in delete brand" })
    }
}

const getBrand = async (req, res) => {
    try {
        let { query } = req.query;
        let filter = query ? { name: { $regex: query, $options: "i" } } : {};

        const brands = await brandModel.find(filter).sort({ name: 1 });

        return res.status(200).json({ success: true, brands })
    } catch (err){
        console.error(err)
        return res.status(500).json({ message: "Error in get brand" })
    }
}

const updateBrandById = async (req, res) => {
    try {
        const { id } = req.params
        const { name } = req.body
        
        if(!name)
            return res.status(400).json({ message: "Please fill in all fields" })
        
        const existingBrand = await brandModel.findOne({ name })
        if(existingBrand && existingBrand._id.toString() !== id)
            return res.status(400).json({ success: false, message: "A brand with the same name already exists" })
        
        const updatedBrand = await brandModel.findByIdAndUpdate(id, { name }, { new: true })
        if(!updatedBrand)
            return res.status(404).json({ success: false, message: "Brand not found" })
        return res.status(200).json({ success: true, message: "Brand updated successfully" })
    } catch (err){
        console.error(err)
        return res.status(500).json({ success: false, message: "Error in update brand" })
    }
}

const getBrandById = async (req, res) => {
    try {
        const { id } = req.params
        const brand = await brandModel.findById(id)
        if(!brand)
            return res.status(404).json({ success: false, message: "Brand not found" })
        return res.status(200).json({ success: true, brand })
    } catch (err){
        console.error(err)
        return res.status(500).json({ message: "Error in get brand by id" })
    }
}

const getBrandsByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        if (!category) {
            return res.status(400).json({ success: false, message: "Category is required" });
        }

        // Find distinct brands for the given category
        const brands = await productModel.distinct("brand", { category: { $regex: `^${category}$`, $options: "i" } });

        return res.status(200).json({ success: true, brands });
    } catch (err) {
        console.error("Error fetching brands:", err);
        return res.status(500).json({ success: false, message: "Error fetching brands by category" });
    }
};

module.exports = {
    addBrand,
    deleteBrand,
    getBrand,
    updateBrandById,
    getBrandById,
    getBrandsByCategory
}