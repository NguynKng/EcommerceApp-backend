const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const puppeteer = require("puppeteer");
const imageModel = require("../models/imageModel");
const { uploadProductImg } = require("../middlewares/uploadImg");
const path = require("path");
const fs = require("fs");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const addProduct = async (req, res) => {
  try {
    // Use the product upload middleware
    uploadProductImg.array("images", 10)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      const {
        name,
        price,
        description,
        slug,
        category,
        quantity,
        brand,
        discount,
      } = req.body;

      if (
        !name ||
        !price ||
        !description ||
        !category ||
        !slug ||
        !quantity ||
        !brand
      ) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required." });
      }

      const existingProduct = await productModel.findOne({ name });
      const existingSlug = await productModel.findOne({ slug });

      if (existingProduct)
        return res
          .status(400)
          .json({ success: false, message: "This product already exists." });
      if (existingSlug)
        return res
          .status(400)
          .json({ success: false, message: "This slug already exists." });

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

      return res.status(201).json({
        success: true,
        product: newProduct,
        message: "Add product successfully.",
      });
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error creating product." });
  }
};

const getProductByID = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id).populate("images");
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    return res.status(200).json({ success: true, product });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error in get product by ID" });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await productModel
      .findOne({ slug })
      .populate("images")
      .populate("ratings.postedBy", "fullName");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    return res.status(200).json({ success: true, product });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error in get product by Slug" });
  }
};

const getAllProduct = async (req, res) => {
  try {
    let { query, category, brand } = req.query;
    let filter = {};

    if (query) {
      filter.name = { $regex: query, $options: "i" };
    }

    if (category) {
      filter.category = { $regex: `^${category}$`, $options: "i" };
    }

    if (brand) {
      filter.brand = { $regex: `^${brand}$`, $options: "i" };
    }

    const products = await productModel
      .find(filter)
      .sort({ name: 1 })
      .populate("images");
    return res.status(200).json({ success: true, products });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error in get all products" });
  }
};

const getProduct = async (req, res) => {
  try {
    let {
      query,
      category,
      brand,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    let filter = {};

    // Tìm kiếm theo tên
    if (query) {
      filter.name = { $regex: query, $options: "i" };
    }

    // Lọc theo danh mục
    if (category) {
      filter.category = { $regex: `^${category}$`, $options: "i" };
    }

    // Lọc theo thương hiệu
    if (brand) {
      filter.brand = { $regex: `^${brand}$`, $options: "i" };
    }

    // Lọc theo khoảng giá
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const total = await productModel.countDocuments(filter);

    const products = await productModel
      .find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .populate("images");

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Error in get all products",
    });
  }
};

const updateProductById = async (req, res) => {
  try {
    // Use the product upload middleware
    uploadProductImg.array("images", 10)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      const { id } = req.params;
      const {
        name,
        price,
        description,
        slug,
        category,
        quantity,
        brand,
        discount,
      } = req.body;

      if (
        !name ||
        !price ||
        !description ||
        !category ||
        !slug ||
        !quantity ||
        !brand
      ) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required." });
      }

      // Find existing product
      const product = await productModel.findById(id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found." });
      }

      // Parse deleted image IDs if provided.
      let deleteImageIds = [];
      if (req.body.deleteImageIds) {
        try {
          deleteImageIds = JSON.parse(req.body.deleteImageIds);
        } catch (parseError) {
          return res.status(400).json({
            success: false,
            message: "Invalid deleteImageIds format.",
          });
        }
      }

      // Remove images specified in deleteImageIds from the product
      if (deleteImageIds.length > 0) {
        for (const delId of deleteImageIds) {
          // Find image document by its ID
          const imgDoc = await imageModel.findById(delId);
          if (imgDoc) {
            const fullPath = path.join(
              __dirname,
              "../public/images/",
              imgDoc.path
            );
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
            await imageModel.findByIdAndDelete(delId);
          }
        }
        // Remove deleted IDs from product.images
        product.images = product.images.filter(
          (imgId) => !deleteImageIds.includes(imgId.toString())
        );
      }

      // Process new images if provided
      if (req.files && req.files.length > 0) {
        console.log("Received files:", req.files);
        const newImageIds = await Promise.all(
          req.files.map(async (file, index) => {
            const imageUrl = `product/${slug}/${file.filename}`;
            // If product.images doesn't contain a thumbnail, set the first new image as thumbnail.
            // Otherwise, mark as additional.
            const imageType =
              product.images.length === 0 && index === 0
                ? "thumbnail"
                : "additional";
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
        message: "Product updated successfully.",
      });
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error updating product." });
  }
};

const deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;
    // Find the product first
    const product = await productModel.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    // Construct the folder path based on product.slug
    const folderPath = path.join(
      __dirname,
      "../public/images/product",
      product.slug
    );
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

    return res
      .status(200)
      .json({ success: true, message: "Product deleted successfully." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting product." });
  }
};

const getCrawlData = async (req, res) => {
  try {
    const { url } = req.body;
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "load" });

    // Extract data from UL with specific class
    const data = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".item > a")).map((item) => ({
        productName: item.querySelector("h3")?.textContent.trim() || "No Name",
        img:
          item.querySelector(".item-img > img")?.getAttribute("src") ||
          "No Image",
        price: item.querySelector(".price")?.textContent.trim() || "No Price",
      }));
    });

    // Send response to client immediately
    res.status(200).json({ success: true, data });

    // Await a delay of 1 hour before closing the browser
    console.log("Delaying for 1 hour before closing the browser...");
    await delay(3600000); // 1 hour (3600000 ms)

    console.log("Closing browser now...");
    await browser.close();
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error crawling data." });
  }
};

const getFeaturedCollections = async (req, res) => {
  try {
    const products = await productModel.aggregate([{ $sample: { size: 20 } }]);

    // Populate field "images" sau khi dùng aggregate
    const populatedProducts = await productModel.populate(products, {
      path: "images",
    });

    return res.status(200).json({ success: true, products: populatedProducts });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching collections." });
  }
};

const getSpecialProduct = async (req, res) => {
  try {
    const products = await productModel.aggregate([{ $sample: { size: 20 } }]);

    // Populate field "images" sau khi dùng aggregate
    const populatedProducts = await productModel.populate(products, {
      path: "images",
    });

    return res.status(200).json({ success: true, products: populatedProducts });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching collections." });
  }
};

const getPopularProduct = async (req, res) => {
  try {
    const products = await productModel.aggregate([{ $sample: { size: 20 } }]);

    // Populate field "images" sau khi dùng aggregate
    const populatedProducts = await productModel.populate(products, {
      path: "images",
    });

    return res.status(200).json({ success: true, products: populatedProducts });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching collections." });
  }
};

const rateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { star, comment } = req.body;
    const userId = req.user._id; // assuming you use auth middleware

    if (!star || star < 1 || star > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Star rating must be 1-5." });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    // add new
    product.ratings.push({
      star,
      comment,
      postedBy: userId,
      createdAt: new Date(),
    });

    // recalculate average rating
    const totalStars = product.ratings.reduce((acc, r) => acc + r.star, 0);
    product.totalRating = product.ratings.length
      ? (totalStars / product.ratings.length).toFixed(1)
      : 0;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Rating submitted successfully.",
      product,
    });
  } catch (err) {
    console.error("Rate Product Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

module.exports = {
  addProduct,
  getProductByID,
  getCrawlData,
  getProduct,
  getProductBySlug,
  updateProductById,
  deleteProductById,
  getFeaturedCollections,
  getSpecialProduct,
  getPopularProduct,
  getAllProduct,
  rateProduct,
};
