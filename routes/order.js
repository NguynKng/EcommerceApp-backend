const router = require("express").Router();
const {
  createOrder,
  getRecentOrders,
  getAllCustomerOrderStats,
  getAllOrders,
  getOrderById,
} = require("../controllers/order");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, isAdmin, getAllOrders); // Assuming this is for admin to get all orders
router.post("/create", authMiddleware, createOrder);
router.get("/recent", authMiddleware, isAdmin, getRecentOrders);
router.get("/detail/:id", getOrderById); // Assuming this is for admin to get order by ID
router.get(
  "/customer-stats",
  authMiddleware,
  isAdmin,
  getAllCustomerOrderStats
);

module.exports = router;
