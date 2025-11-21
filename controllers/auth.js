const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const sendVerificationEmail = require("../utils/sendEmail");
const ResetToken = require("../models/resetToken");

const signup = async (req, res) => {
  try {
    const { email, fullName, password, confirmPassword, phoneNumber } =
      req.body;
    if (!email || !fullName || !password || !confirmPassword || !phoneNumber)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({
        success: false,
        message: "Invalid email, please enter a valid email.",
      });
    else {
      const existingEmail = await userModel.findOne({ email: email });
      if (existingEmail)
        return res.status(400).json({
          success: false,
          message: "Email already exists, please try another email.",
        });
    }

    if (password.length < 6)
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    else {
      if (password !== confirmPassword)
        return res
          .status(400)
          .json({ success: false, message: "Passwords do not match." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      email,
      fullName,
      password: hashedPassword,
      phoneNumber,
    });
    await newUser.save();

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await ResetToken.findOneAndDelete({ email }); // Xóa token cũ nếu có
    await ResetToken.create({ email, code }); // Tạo token mới

    await sendVerificationEmail(email, code, fullName, "verifyAccount");

    return res
      .status(200)
      .json({ success: true, message: "Create account successfully." });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });

    const user = await userModel
      .findOne({ email })
      .populate({
        path: "cart",
        populate: {
          path: "items.product",
          populate: {
            path: "images", // ✅ Populate images if they reference another collection
            select: "_id path type",
          },
          select: "_id name slug price images quantity description",
        },
      })
      .populate({
        path: "wishlist",
        populate: {
          path: "images", // ✅ Populate images for wishlist products
          select: "_id path type",
        },
        select: "_id name slug price images stock description",
      });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res
        .status(404)
        .json({ success: false, message: "Invalid email or password." });

    const token = generateToken(user._id, res);

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isBlocked: user.isBlocked,
        cart: user.cart, // ✅ Now includes product details
        wishlist: user.wishlist, // ✅ Now includes product details
        token,
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });

    const admin = await userModel
      .findOne({ email })
      .populate({
        path: "cart",
        populate: {
          path: "items.product",
          populate: {
            path: "images", // ✅ Populate images if they reference another collection
            select: "_id path type",
          },
          select: "_id name slug price images stock description",
        },
      })
      .populate({
        path: "wishlist",
        populate: {
          path: "images", // ✅ Populate images for wishlist products
          select: "_id path type",
        },
        select: "_id name slug price images stock description",
      });

    if (!admin)
      return res
        .status(404)
        .json({ success: false, message: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch)
      return res
        .status(404)
        .json({ success: false, message: "Invalid email or password." });

    if (admin.role !== "admin")
      return res
        .status(403)
        .json({ success: false, message: "You are not an administrator." });

    const token = generateToken(admin._id, res);

    return res.status(200).json({
      success: true,
      user: {
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        role: admin.role,
        isBlocked: admin.isBlocked,
        cart: admin.cart, // ✅ Now includes product details
        wishlist: admin.wishlist, // ✅ Now includes product details
        token,
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("jwt-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Must match `setCookie`
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });
    return res
      .status(200)
      .json({ message: "Logged out successfully.", success: true });
  } catch (error) {
    console.error("Error in logout controller:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const authCheck = (req, res) => {
  try {
    return res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    console.log("Error in authCheck controller:" + error.message);
    return res
      .status(200)
      .json({ success: false, message: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email not found" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await ResetToken.findOneAndDelete({ email }); // Xóa token cũ nếu có
    await ResetToken.create({ email, code }); // Tạo token mới

    const username = user.fullName;

    await sendVerificationEmail(email, code, username, "resetPassword");

    res
      .status(200)
      .json({ success: true, message: "Reset code sent to email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const verifyCode = async (req, res) => {
  try {
    const { email, code, action } = req.body;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Check if valid reset token exists and is not expired
    const resetToken = await ResetToken.findOne({
      email,
      code,
      createdAt: { $gt: fiveMinutesAgo },
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code",
      });
    }

    if (action === "verifyAccount") {
      await userModel.findOneAndUpdate(
        { email },
        { isVerified: true },
        { new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Code verified",
    });
  } catch (err) {
    console.error("Verify code error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Check token existence
    const token = await ResetToken.findOne({ email });
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token expired or not found",
      });
    }
    const salt = await bcrypt.genSalt(10);
    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const user = await userModel.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    // Clean up token
    await ResetToken.deleteOne({ email });

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  signup,
  loginUser,
  logout,
  loginAdmin,
  authCheck,
  forgotPassword,
  verifyCode,
  resetPassword,
};
