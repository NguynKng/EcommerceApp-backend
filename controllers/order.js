const Order = require("../models/orderModel");
const User = require("../models/userModel"); // if you want to validate user
const Product = require("../models/productModel"); // to validate product if needed
const Cart = require("../models/cartModel"); // Assuming you have a cart model

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { products, shipping, total } = req.body;

    if (!products || !shipping || !total) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // 1. Check quantity availability
    for (const item of products) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      if (product.quantity < item.count) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for product "${product.name}". Available: ${product.quantity}, Requested: ${item.count}`,
        });
      }
    }

    // 2. Deduct stock
    for (const item of products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.count },
      });
    }

    // 3. Create order
    const newOrder = new Order({
      products,
      shipping,
      total,
      orderBy: userId,
      orderStatus: "Not Processed",
    });

    await newOrder.save();

    // 4. Clear user cart
    const user = await User.findById(userId);
    user.cart = null;
    await user.save();
    await Cart.findOneAndDelete({ orderBy: userId });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};


exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id).populate({
      path: "products",
      populate: {
        path: "product",
        populate: {
          path: "images", // ✅ Populate images if they reference another collection
          select: "_id path type",
        },
        select: "_id name price images",
      },
    });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error in get order by id." });
  }
};

exports.getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("orderBy", "fullName email") // ✅ Populate user details
      .sort({ createdAt: -1 }) // ✅ Sort by most recent
      .limit(20); // ✅ Limit to 20 orders

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get recent orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
        .populate("orderBy", "fullName email") // Populate user details
        .sort({ createdAt: -1 }); // Sort by most recent
    
        return res.status(200).json({
        success: true,
        orders,
        });
    } catch (error) {
        console.error("Get all orders error:", error);
        return res.status(500).json({
        success: false,
        message: "Internal server error",
        });
    }
}

exports.getAllCustomerOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$orderBy", // Group by customer (user ID)
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: "$total" },
        },
      },
      {
        $lookup: {
          from: "users", // collection name (should be lowercase of model)
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $project: {
          _id: 0,
          customerId: "$customer._id",
          fullName: "$customer.fullName",
          email: "$customer.email",
          totalOrders: 1,
          totalAmount: 1,
        },
      },
      {
        $sort: { totalAmount: -1 } // Optional: sort by spending
      }
    ]);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error in getAllCustomerOrderStats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};