const couponModel = require("../models/couponModel")

const addCoupon = async (req, res) => {
    try {
        const { name, code, discount, expiryDate } = req.body
        if(!name ||!code ||!discount ||!expiryDate)
            return res.status(400).json({ success: false, message: "All fields are required." })
        
        const existingCoupon = await couponModel.findOne({ code })
        if(existingCoupon)
            return res.status(400).json({ success: false, message: "Coupon code already exists."})
        const newCoupon = new couponModel({ name, code, discount, expiryDate })
        await newCoupon.save()
        return res.status(201).json({ success: true, coupon: newCoupon, message: "Coupon added successfully" })
        } catch (error) {
            console.error(error)
            return res.status(500).json({ success: false, message: "Error in adding coupon." })
        }
}

const getCouponById = async (req, res) => {
    try {
        const { id } = req.params
        const coupon = await couponModel.findById(id)
        if(!coupon)
            return res.status(404).json({ success: false, message: "Coupon not found."})
        return res.status(200).json({ success: true, coupon })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "Error in getting coupon by id." })
    }
}

const updateCouponById = async (req, res) => {
    try {
        const { id } = req.params
        const { name, code, discount, expiryDate } = req.body
        if(!name ||!code ||!discount ||!expiryDate)
            return res.status(400).json({ success: false, message: "All fields are required." })
        const existingCoupon = await couponModel.findOne({code})

        if(existingCoupon && existingCoupon._id.toString() !== id)
            return res.status(400).json({ success: false, message: "Coupon code already exists."})

        const coupon = await couponModel.findByIdAndUpdate(id, { name, code, discount, expiryDate }, { new: true })

        if(!coupon)
            return res.status(404).json({ success: false, message: "Coupon not found."})

        return res.status(200).json({ success: true, message: "Coupon updated successfully" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "Error in updating coupon by id." })
    }
}

const deleteCouponById = async (req, res) => {
    try {
        const { id } = req.params
        const deletedCoupon = await couponModel.findByIdAndDelete(id)
        if(!deletedCoupon)
            return res.status(404).json({ success: false, message: "Coupon not found."})
        return res.status(200).json({ success: true, message: "Coupon deleted successfully."})
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "Error in deleting coupon by id." })
    }
}

const getCoupon = async (req, res) => {
    try {
        let { query } = req.query;
        let filter = query ? { name: { $regex: query, $options: "i" } } : {};
        const coupons = await couponModel.find(filter)
        return res.status(200).json({ success: true, coupons })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "Error in getting all coupons." })
    }
}

module.exports = {
    addCoupon,
    getCouponById,
    updateCouponById,
    deleteCouponById,
    getCoupon
}