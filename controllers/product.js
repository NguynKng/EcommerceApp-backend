const productModel = require("../models/productModel")
const userModel = require("../models/userModel")

const addProduct = async (req, res) => {
    try {
        const { name, price, description, slug, category, quantity, color, brand } = req.body
        if(!name ||!price ||!description ||!category ||!slug ||!quantity ||!color ||!brand)
            return res.status(400).json({ success: false, message: "All fields are required." })

        const existingProduct = await productModel.findOne({ name })
        if(existingProduct)
            return res.status(400).json({ success: false, message: "This product is already exists." })

        const newProduct = new productModel({ name, price, description, category, slug, quantity, color, brand })
        await newProduct.save()
        return res.status(201).json({ success: true, product: newProduct })
    } catch(err) {
        console.error(err)
        return res.status(500).json({success: false, message: "Error in create product"})
    }
}

const getProductByID = async (req, res) => {
    try {
        const { id } = req.params
        const product = await productModel.findById(id)
        if(!product)
            return res.status(404).json({ success: false, message: "Product not found."})
        return res.status(200).json({ success: true, product })
    } catch(err) {
        console.error(err)
        return res.status(500).json({success: false, message: "Error in get product by ID"})
    }
}

const getProduct = async (req, res) => {
    try {
        const products = await productModel.find(req.query)
        return res.status(200).json({ success: true, products })
    } catch(err) {
        console.error(err)
        return res.status(500).json({success: false, message: "Error in get all products"})
    }
}

const updateProductById = async (req, res) => {
    try {
        const { id } = req.params
        const { name, price, description, category, slug, quantity, color, brand } = req.body
        if(!name ||!price ||!description ||!category ||!slug ||!quantity ||!color ||!brand)
            return res.status(400).json({ success: false, message: "All fields are required." })
        
        const updatedProduct = await productModel.findByIdAndUpdate(id, req.body, {new: true})
        if(!updatedProduct)
            return res.status(404).json({ success: false, message: "Product not found."})
        return res.status(200).json({ success: true, product: updatedProduct })
    }   catch (err) {
        console.error(err)
        return res.status(500).json({success: false, message: "Error in update product"})
    }
}

const deleteProductById = async (req, res) => {
    try {
        const { id } = req.params
        const deletedProduct = await productModel.findByIdAndDelete(id)
        if(!deletedProduct)
            return res.status(404).json({ success: false, message: "Product not found."})
        return res.status(200).json({ success: true, message: "Product deleted successfully." })
    } catch(err) {
        console.error(err)
        return res.status(500).json({success: false, message: "Error in delete product"})
    }
}

const addToWishList = async (req, res) => {
    const { productId } = req.body
    const { _id } = req.user
    try {
        const user = await userModel.findById(_id)
        const alreadyAdded = user.wishlist.find((id) => id.toString() === productId)
        if(alreadyAdded){
            await userModel.findByIdAndUpdate(
                _id,
                { $pull: { wishlist: productId } },
                { new: true }
            )
            return res.status(200).json({ success: true, message: "Product removed from wishlist." })
        } else {
            await userModel.findByIdAndUpdate(
                _id,
                { $push: { wishlist: productId } },
                { new: true }
            )
            return res.status(200).json({ success: true, message: "Product added to wishlist." })
        }
    } catch (err){
        console.error(err)
        return res.status(500).json({ success: false, message: "Error in add to wish list."})
    }
}

const rating = async (req, res) => {
    const { productId, star, comment } = req.body
    const { _id } = req.user
    try {
        const product = await productModel.findById(productId)
        const alreadyRated = product.ratings.find((userId) => userId.postedBy.toString() === _id.toString())
        if(alreadyRated){
            await productModel.updateOne(
                {
                    ratings: { $elemMatch: alreadyRated }
                },
                {
                    $set: {"ratings.$.star": star, "ratings.$.comment": comment, "ratings.$.updatedAt": Date.now()}
                },
                {
                    new: true 
                }
            )
            //return res.status(200).json({ success: true, message: "Rate again for this product successfully." })
        } else {
            await productModel.findByIdAndUpdate(
                productId,
                { 
                    $push: {
                        ratings: {
                            star: star, 
                            postedBy: _id,
                            comment: comment,
                            createdAt: Date.now()
                        } 
                    } 
                },
                { 
                    new: true 
                }
            )
            //return res.status(200).json({ success: true, message: "Rate for this product successfully." })
        }
        const getAllRatings = await productModel.findById(productId)
        let totalRating = getAllRatings.ratings.length
        let ratingSum = getAllRatings.ratings.map((item) => item.star).reduce((prev, curr) => prev + curr, 0)
        let actualRating = Math.round(ratingSum / totalRating)

        await productModel.findByIdAndUpdate(
            productId, 
            { totalRating: actualRating }, 
            { new: true }
        )
        return res.status(200).json({ success: true, message: "Rate for this product successfully." })
    } catch (err){
        console.error(err)
        return res.status(500).json({ success: false, message: "Error in rating product."})
    }
}

module.exports = { addProduct, getProductByID, getProduct, updateProductById, deleteProductById, addToWishList, rating }