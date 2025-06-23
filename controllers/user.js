const userModel = require("../models/userModel");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const couponModel = require("../models/couponModel");
const orderModel = require("../models/orderModel");
const uniqid = require("uniqid");
const bcrypt = require("bcrypt");

const getUser = async (req, res) => {
  try {
    const users = await userModel.find(req.query).select("-password");
    return res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ success: false, message: "Error in get user." });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findOne({ _id: id }).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    return res.status(200).json({ user, success: true });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ success: false, message: "Error in get user by id." });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findByIdAndDelete(id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully." });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ success: false, message: "Error in delete user." });
  }
};

const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await userModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    return res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ success: false, message: "Error in update user." });
  }
};

const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );
    if (!updatedUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    return res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Error in block user." });
  }
};

const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    );
    if (!updatedUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    return res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Error in unblock user." });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Old password is incorrect." });
    }

    if (newPassword.length < 6)
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    else {
      if (newPassword !== confirmPassword)
        return res
          .status(400)
          .json({ success: false, message: "Passwords do not match." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await userModel.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ success: false, message: "Error in update password user." });
  }
};

const getWishList = async (req, res) => {
  const { _id } = req.user;
  try {
    const wishlist = await userModel
      .findById(_id)
      .select("wishlist")
      .populate("images");

    if (wishlist.length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "No wishlist existed." });
    }

    return res.status(200).json({ success: true, wishlist });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error in get wishlist." });
  }
};

const addToWishList = async (req, res) => {
  const { productId } = req.body;
  const { _id } = req.user;

  try {
    const user = await userModel.findById(_id);
    const alreadyAdded = user.wishlist.includes(productId);

    // ✅ Update the wishlist
    if (alreadyAdded) {
      await userModel.findByIdAndUpdate(
        _id,
        { $pull: { wishlist: productId } },
        { new: true }
      );
    } else {
      await userModel.findByIdAndUpdate(
        _id,
        { $push: { wishlist: productId } },
        { new: true }
      );
    }

    // ✅ Fetch updated wishlist with full product details
    const updatedUser = await userModel
      .findById(_id)
      .select("wishlist")
      .populate({
        path: "wishlist",
        populate: { path: "images", select: "_id path type" }, // ✅ Populate images
        select: "_id name slug price images quantity description",
      });

    return res.status(200).json({
      success: true,
      message: alreadyAdded
        ? "Product removed from wishlist."
        : "Product added to wishlist.",
      updatedWishlist: updatedUser.wishlist, // ✅ Fully populated wishlist
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error updating wishlist." });
  }
};

const addToCart = async (req, res) => {
  const { _id } = req.user;
  const { productId, quantity } = req.body;

  try {
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    const discountedPrice =
      product.price - (product.price * product.discount) / 100;

    let cart = await cartModel.findOne({ orderBy: _id });
    if (!cart) {
      cart = new cartModel({ orderBy: _id, items: [], total: 0 });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    const totalQuantityInCart = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    if (totalQuantityInCart > product.quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantity} item(s) available in stock.`,
      });
    }

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = existingItem.quantity * discountedPrice;
    } else {
      cart.items.push({
        product: productId,
        quantity: quantity,
        price: discountedPrice * quantity,
      });
    }

    cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);
    await cart.save();

    await userModel.findByIdAndUpdate(_id, { cart: cart._id });

    const updatedCart = await cartModel.findById(cart._id).populate({
      path: "items.product",
      populate: { path: "images", select: "_id path type" },
      select: "_id name slug price images quantity description",
    });

    return res.status(200).json({
      success: true,
      message: "Product added to cart.",
      cart: updatedCart,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error adding product to cart." });
  }
};

const getUserCart = async (req, res) => {
  const { _id } = req.user; // Get user ID

  try {
    const cart = await cartModel.findOne({ orderBy: _id }).populate({
      path: "items.product",
      populate: { path: "images", select: "_id path type" }, // ✅ Populate images
      select: "_id name slug price images quantity description",
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty.",
        cart: { items: [], total: 0 },
      });
    }

    return res.status(200).json({ success: true, cart });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching cart." });
  }
};

const removeFromCart = async (req, res) => {
  const { _id } = req.user; // Get logged-in user
  const { productId } = req.body; // ✅ Use URL param instead of req.body

  try {
    let cart = await cartModel.findOne({ orderBy: _id });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found." });
    }
    // Remove the specific product
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    // ✅ Corrected total price calculation
    cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);

    await cart.save();

    // **Populate cart with product details & images**
    const updatedCart = await cartModel.findById(cart._id).populate({
      path: "items.product",
      populate: { path: "images", select: "_id path type" }, // ✅ Populate images
      select: "_id name slug price images quantity description",
    });

    return res.status(200).json({
      success: true,
      message: "Product removed from cart.",
      cart: updatedCart,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error removing product from cart." });
  }
};

const clearCart = async (req, res) => {
  const { _id } = req.user;

  try {
    const cart = await cartModel.findOneAndDelete({ user: _id });

    if (!cart) {
      return res
        .status(200)
        .json({ success: true, message: "Cart is already empty." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Cart successfully cleared." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error clearing cart." });
  }
};

const applyCoupon = async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  try {
    const validCoupon = await couponModel.findOne({ name: coupon });
    if (!validCoupon) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon not found." });
    }
    let { cartTotal } = await cartModel
      .findOne({ orderBy: _id })
      .populate("products.product");
    let totalAfterDiscount = (
      cartTotal -
      (cartTotal * validCoupon.discount) / 100
    ).toFixed(2);
    await cartModel.findOneAndUpdate(
      { orderBy: _id },
      { totalAfterDiscount },
      { new: true }
    );
    return res
      .status(200)
      .json({ success: true, message: "Coupon applied successfully." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error in apply coupon." });
  }
};

const getOrder = async (req, res) => {
  const { _id } = req.user;
  try {
    const orders = await orderModel.find({ orderBy: _id });
    if (!orders)
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    return res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error in get order." });
  }
};

const updateOrder = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  try {
    const findOrder = await orderModel.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: { status: status },
      },
      { new: true }
    );

    if (!findOrder)
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });

    return res.status(200).json({ success: true, order: findOrder });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error in update order." });
  }
};

const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await orderModel.findById(id).populate({
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

const rating = async (req, res) => {
  const { productId, star, comment } = req.body;
  const { _id } = req.user;
  try {
    const product = await productModel.findById(productId);
    const alreadyRated = product.ratings.find(
      (userId) => userId.postedBy.toString() === _id.toString()
    );
    if (alreadyRated) {
      await productModel.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: {
            "ratings.$.star": star,
            "ratings.$.comment": comment,
            "ratings.$.updatedAt": Date.now(),
          },
        },
        {
          new: true,
        }
      );
      return res.status(200).json({
        success: true,
        message: "Rate again for this product successfully.",
      });
    } else {
      await productModel.findByIdAndUpdate(
        productId,
        {
          $push: {
            ratings: {
              star: star,
              postedBy: _id,
              comment: comment,
              createdAt: Date.now(),
            },
          },
        },
        {
          new: true,
        }
      );
      //return res.status(200).json({ success: true, message: "Rate for this product successfully." })
    }
    const getAllRatings = await productModel.findById(productId);
    let totalRating = getAllRatings.ratings.length;
    let ratingSum = getAllRatings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingSum / totalRating);

    await productModel.findByIdAndUpdate(
      productId,
      { totalRating: actualRating },
      { new: true }
    );
    return res
      .status(200)
      .json({ success: true, message: "Rate for this product successfully." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error in rating product." });
  }
};

module.exports = {
  getUser,
  getUserById,
  deleteUserById,
  updateUserById,
  blockUser,
  unblockUser,
  updatePassword,
  getWishList,
  getUserCart,
  removeFromCart,
  addToCart,
  clearCart,
  applyCoupon,
  getOrder,
  rating,
  addToWishList,
  updateOrder,
  getOrderById,
};
