const productModel = require("../models/productModel")
const userModel = require("../models/userModel")
const imageModel = require("../models/imageModel")
const { uploadProductImg } = require("../middlewares/uploadImg")
const path = require('path');
const fs = require('fs');

const addProduct = async (req, res) => {
    try {
    // Use the product upload middleware
    uploadProductImg.array("images", 10)(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        const { name, price, description, slug, category, quantity, brand, discount } = req.body;
        
        if (!name || !price || !description || !category || !slug || !quantity || !brand) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const existingProduct = await productModel.findOne({ name });
        const existingSlug = await productModel.findOne({ slug });

        if (existingProduct)
            return res.status(400).json({ success: false, message: "This product already exists." });
        if (existingSlug)
            return res.status(400).json({ success: false, message: "This slug already exists." });

        // Process images if provided
        let imageIds = [];
        if (req.files && req.files.length > 0) {
            // Create an Image document for each file and collect its ObjectId
            imageIds = await Promise.all(
                req.files.map(async (file, index) => {
                    const imageUrl = `product/${slug}/${file.filename}`;
                    const imageType = index === 0 ? "thumbnail" : "additional";
                    const imageDoc = new imageModel({
                        path: imageUrl,
                        slug: slug,
                        type: imageType,
                    });
                    await imageDoc.save();
                    return imageDoc._id;
                })
            );
        }

        // Create and save product document with the image IDs
        const newProduct = new productModel({
            name,
            price,
            description,
            category,
            slug,
            quantity,
            brand,
            discount,
            images: imageIds, // Store the array of image ObjectIDs
        });
        await newProduct.save();

        return res.status(201).json({ success: true, product: newProduct, message: "Add product successfully." });
    });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error creating product." });
    }
};

const getProductByID = async (req, res) => {
    try {
        const { id } = req.params
        const product = await productModel.findById(id).populate('images');
        if(!product)
            return res.status(404).json({ success: false, message: "Product not found."})
        return res.status(200).json({ success: true, product })
    } catch(err) {
        console.error(err)
        return res.status(500).json({success: false, message: "Error in get product by ID"})
    }
}

const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await productModel.findOne({ slug }).populate('images');

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }
        
        return res.status(200).json({ success: true, product });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error in get product by Slug" });
    }
}

const getProduct = async (req, res) => {
    try {
        let { query, category } = req.query
        let filter = {};

        if (query) {
            filter.name = { $regex: query, $options: "i" };
        }

        if (category) {
            filter.category = { $regex: `^${category}$`, $options: "i" };
        }
        
        const products = await productModel.find(filter).populate("images")
        return res.status(200).json({ success: true, products })
    } catch(err) {
        console.error(err)
        return res.status(500).json({success: false, message: "Error in get all products"})
    }
}

const updateProductById = async (req, res) => {
    try {
    // Use the product upload middleware
    uploadProductImg.array("images", 10)(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        const { id } = req.params;
        const { name, price, description, slug, category, quantity, brand, discount } = req.body;

        if (!name || !price || !description || !category || !slug || !quantity || !brand) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        // Find existing product
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        // Parse deleted image IDs if provided.
        let deleteImageIds = [];
        if (req.body.deleteImageIds) {
            try {
                deleteImageIds = JSON.parse(req.body.deleteImageIds);
            } catch (parseError) {
                return res.status(400).json({ success: false, message: "Invalid deleteImageIds format." });
            }
        }

        // Remove images specified in deleteImageIds from the product
        if (deleteImageIds.length > 0) {
            for (const delId of deleteImageIds) {
                // Find image document by its ID
                const imgDoc = await imageModel.findById(delId);
                if (imgDoc) {
                    const fullPath = path.join(__dirname, "../public/images/", imgDoc.path);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                    await imageModel.findByIdAndDelete(delId);
                }
            }
            // Remove deleted IDs from product.images
            product.images = product.images.filter(imgId => !deleteImageIds.includes(imgId.toString()));
        }

        // Process new images if provided
        if (req.files && req.files.length > 0) {
            const newImageIds = await Promise.all(
                req.files.map(async (file, index) => {
                    const imageUrl = `product/${slug}/${file.filename}`;
                    // If product.images doesn't contain a thumbnail, set the first new image as thumbnail.
                    // Otherwise, mark as additional.
                    const imageType = product.images.length === 0 && index === 0 ? "thumbnail" : "additional";
                    const imageDoc = new imageModel({
                        path: imageUrl,
                        slug: slug,
                        type: imageType,
                    });
                    await imageDoc.save();
                    return imageDoc._id;
                })
            );
            // Append new image IDs to existing product.images array
            product.images = product.images.concat(newImageIds);
        }

        // Update other product fields
        product.name = name;
        product.price = price;
        product.description = description;
        product.slug = slug;
        product.category = category;
        product.quantity = quantity;
        product.brand = brand;
        product.discount = discount;

        await product.save();

        return res.status(200).json({
            success: true,
            product,
            message: "Product updated successfully."
        });
    });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error updating product." });
    }
};

const deleteProductById = async (req, res) => {
    try {
        const { id } = req.params;
        // Find the product first
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }
        
        // Construct the folder path based on product.slug
        const folderPath = path.join(__dirname, "../public/images/product", product.slug);
        // Delete the folder and all its contents if it exists
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true, force: true });
        }

        // Optionally remove image documents related to this product
        if (product.images && product.images.length > 0) {
            await imageModel.deleteMany({ _id: { $in: product.images } });
        }
        
        // Delete the product document
        await productModel.findByIdAndDelete(id);
        
        return res.status(200).json({ success: true, message: "Product deleted successfully." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error deleting product." });
    }
}

module.exports = { addProduct, getProductByID, getProduct, getProductBySlug, updateProductById, deleteProductById }