const userModel = require("../models/userModel")
const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")
const couponModel = require("../models/couponModel")
const orderModel = require("../models/orderModel")
const uniqid = require("uniqid")
const bcrypt = require("bcrypt")
const { response } = require("express")

const getUser = async (req, res) => {
    try {
        const users = await userModel.find(req.query).select('-password')
        return res.status(200).json({users})
    } catch (err) {
        console.error(err)
        return res.status(400).json({success: false, message: "Error in get user."})
    }
}

const getUserById = async (req, res) => {
    try {
        const { id } = req.params
        const user = await userModel.findOne({_id: id}).select("-password")
        if(!user)
            return res.status(404).json({success: false, message: "User not found."})
        return res.status(200).json({ user, success:true })
    } catch (err) {
        console.error(err)
        return res.status(400).json({ success: false, message: "Error in get user by id." })
    }
}

const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params
        const user = await userModel.findByIdAndDelete(id)
        if(!user)
            return res.status(404).json({success: false, message: "User not found."})
        return res.status(200).json({ success: true, message: "User deleted successfully." })
    } catch (err) {
        console.error(err)
        return res.status(400).json({ success: false, message: "Error in delete user." })
    }
}

const updateUserById = async (req, res) => {
    try {
        const { id } = req.params
        const updatedUser = await userModel.findByIdAndUpdate(id, req.body, {new: true})
        if(!updatedUser)
            return res.status(404).json({success: false, message: "User not found."})
        return res.status(200).json({ success: true, user: updatedUser })
    } catch (err) {
        console.error(err)
        return res.status(400).json({ success: false, message: "Error in update user." })
    }
}

const blockUser = async (req, res) => {
    try {
        const { id } = req.params
        const updatedUser = await userModel.findByIdAndUpdate(id, {isBlocked: true}, {new: true})
        if(!updatedUser)
            return res.status(404).json({success: false, message: "User not found."})
        return res.status(200).json({ success: true, user: updatedUser })
    } catch (err) {
        return res.status(500).json({success: false, message: "Error in block user."})
    }
}

const unblockUser = async (req, res) => {
    try {
        const { id } = req.params
        const updatedUser = await userModel.findByIdAndUpdate(id, {isBlocked: false}, {new: true})
        if(!updatedUser)
            return res.status(404).json({success: false, message: "User not found."})
        return res.status(200).json({ success: true, user: updatedUser })
    } catch(err) {
        return res.status(500).json({ success: false, message: "Error in unblock user." })
    }
}

const updatePassword = async (req, res) => {
    try {
        const { id } = req.params
        const user = await userModel.findById(id)
        const { oldPassword, newPassword, confirmPassword } = req.body

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." })
        }

        if (!oldPassword ||!newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: "All fields are required." })
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password)
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Old password is incorrect." })
        }

        if (newPassword.length < 6)
            return res.status(400).json({success: false, message: 'Password must be at least 6 characters long'})
        else{
            if (newPassword !== confirmPassword)
                return res.status(400).json({success: false, message: 'Passwords do not match.'})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        await userModel.findByIdAndUpdate(id, {password: hashedPassword}, {new: true})

        return res.status(200).json({ success: true })
    } catch (err) {
        console.error(err)
        return res.status(400).json({ success: false, message: "Error in update password user." })
    }
}

const getWishList = async (req, res) => {
    const { _id } = req.user
    try {
        const wishlist = await userModel.findById(_id).select("wishlist")

        if (wishlist.length == 0) {
            return res.status(404).json({ success: false, message: "No wishlist existed." })
        }
    
        return res.status(200).json({ success: true, wishlist })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Error in get wishlist." })
    }
}

const userCart = async (req, res) => {
    const { cart } = req.body
    const { _id } = req.user
    try {
        let products = []
        const user = await userModel.findById(_id)
        const alreadyExistCart = await cartModel.findOne({orderBy: user._id})
        if(alreadyExistCart){
            alreadyExistCart.remove()
        }

        for(let i = 0; i < cart.length; i++){
            let object = {}
            object.product = cart[i]._id
            object.count = cart[i].count
            object.color = cart[i].color
            let getPrice = await productModel.findById(cart[i]._id).select("price").exec()
            object.price = getPrice.price
            products.push(object)
        }
        let cartTotal = 0

        for(let i = 0; i < cart.length; i++){
            cartTotal += products[i].count * products[i].price
        }

        let newCart = new cartModel({
            products,
            cartTotal,
            orderBy: user._id
        })

        await newCart.save()
        return res.status(200).json({ success: true, message: "Cart added successfully."})
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Error in user cart." })
    }
}

const getUserCart = async (req, res) => {
    const { _id } = req.user
    try {
        const cart = await cartModel.findOne({orderBy: _id}).populate("products.product")
        if(!cart){
            return res.status(200).json({ success: true, message: "Cart not found."})
        }
        return res.status(200).json({ success: true,  cart})
    } catch(err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Error in get user cart." })
    }
}

const emptyCart = async (req, res) => {
    const { _id } = req.user
    try {
        const cart = await cartModel.findOneAndDelete({orderBy: _id})
        if(!cart){
            return res.status(200).json({ success: true, message: "Cart not found"})
        }
        return res.status(200).json({ success: true,  message: "Cart successfully removed"})
    } catch(err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Error in empty cart." })
    }
}

const applyCoupon = async (req, res) => {
    const { coupon } = req.body
    const { _id } = req.user 
    try{
        const validCoupon = await couponModel.findOne({ name: coupon })
        if(!validCoupon){
            return res.status(400).json({ success: false, message: "Coupon not found."})
        }
        let { cartTotal } = await cartModel.findOne({ orderBy: _id }).populate("products.product")
        let totalAfterDiscount = (
            cartTotal - (cartTotal * validCoupon.discount) / 100
        ).toFixed(2)
        await cartModel.findOneAndUpdate({ orderBy: _id }, { totalAfterDiscount }, { new: true})
        return res.status(200).json({ success: true, message: "Coupon applied successfully."})
    } catch(err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Error in apply coupon." })
    }
}

const createOrder = async (req, res) => {
    const { COD, couponApplied } = req.body
    const { _id } = req.user
    try{
        if (!COD){
            return res.status(400).json({ success: false, message: "COD is required."})
        }
        let userCart = await cartModel.findOne({ orderBy: _id })
        let finalAmount = 0
        if (couponApplied && userCart.totalAfterDiscount){
            finalAmount = userCart.totalAfterDiscount
        } else {
            finalAmount = userCart.cartTotal
        }

        await new orderModel({
            products: userCart.products,
            paymentIntent: {
                id: uniqid(),
                method: "COD",
                amount: finalAmount,
                currency: "USD",
                status: "Cash on Delivery",
                createdAt: Date.now()
            },
            orderBy: _id,
            orderStatus: "Cash on Delivery"
        }).save()

        let update = userCart.products.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item.product._id },
                    update: { $inc: { quantity: -item.count, sold: +item.count } }
                }
            }
        })
        const updated = await productModel.bulkWrite(updated, {})
        return res.status(200).json({ success: true, message: "Order updated successfully"})
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Error in create order." })
    }
}

const getOrder = async (req, res) => {
    const { _id } = req.user
    try {
        const order = await orderModel.findOne({ orderBy: _id }).populate("products.product")
        if (!order)
            return res.status(404).json({ success: false, message: "Order not found." })
        return res.status(200).json({ success: true, order })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Error in get order." })
    }
}

const updateOrder = async (req, res) => {
    const { status } = req.body
    const { id } = req.params
    try {
        const findOrder = await orderModel.findByIdAndUpdate(id, 
            {
            orderStatus: status,
            paymentIntent: { status: status } 
            },
            { new: true }
        )
        
        if (!findOrder)
            return res.status(404).json({ success: false, message: "Order not found."})

        return res.status(200).json({success: true, order: findOrder})
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Error in update order." })
    }
}

module.exports = { getUser, getUserById, deleteUserById, updateUserById, blockUser, unblockUser, updatePassword, getWishList, userCart, getUserCart, emptyCart, applyCoupon, createOrder, getOrder, updateOrder }