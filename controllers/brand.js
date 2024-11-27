const brandModel = require("../models/brandModel")

const addBrand = async (req, res) => {
    try {
        const { name } = req.body
        if(!name)
            return res.status(400).json({ message: "Please fill in all fields" })
        
        const existingBrand = await brandModel.findOne({ name })
        if(existingBrand)
            return res.status(400).json({ message: "A category with the same name already exists" })
        
        const newBrand = new brandModel({ name })
        await newBrand.save()
        return res.status(201).json({ success: true, brand: newBrand })
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
        const category = await brandModel.find(req.query)
        return res.status(200).json({ success: true, category })
    } catch (err){
        console.error(err)
        return res.status(500).json({ message: "Error in get category" })
    }
}

module.exports = {
    addBrand,
    deleteBrand,
    getBrand
}