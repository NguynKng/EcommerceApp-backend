const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/envVars");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies["jwt-token"];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized, token not found.", success: false });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    if (!decoded) {
      return res
        .status(403)
        .json({ message: "Not authorized, invalid token.", success: false });
    }

    const user = await userModel
      .findById(decoded.userId)
      .select("-password")
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
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found.", success: false });
    }

    req.user = user;

    next();
  } catch (err) {
    return res.status(500).json({ message: "Error in middleware" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role === "admin") {
    next();
  } else {
    return res
      .status(403)
      .json({ success: false, message: "You are not an admin" });
  }
};

module.exports = { authMiddleware, isAdmin };
