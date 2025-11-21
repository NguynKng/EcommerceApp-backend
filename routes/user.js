const router = require("express").Router()
const { getUser, getUserById, deleteUserById, updateUserById, blockUser, unblockUser, updatePassword, getWishList,  getUserCart, removeFromCart, clearCart, addToCart, applyCoupon, getOrder, updateOrder, getOrderById, rating, addToWishList } = require("../controllers/user")
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")

router.get("/", getUser)

router.get("/wishlist", authMiddleware, getWishList)
router.put('/wishlist', authMiddleware, addToWishList)
router.put('/rating', authMiddleware, rating)

router.get("/cart", authMiddleware, getUserCart)
router.post("/cart/remove", authMiddleware, removeFromCart)
router.post("/cart/remove-all", authMiddleware, clearCart)
router.post("/cart", authMiddleware, addToCart)

router.post("/cart/apply-coupon", authMiddleware, applyCoupon)

router.get("/order", authMiddleware, getOrder)
router.get("/order/:id", authMiddleware, getOrderById)
router.put("/order/:id", authMiddleware, isAdmin, updateOrder)


router.get("/:id", authMiddleware, isAdmin, getUserById)
router.delete("/:id", authMiddleware, isAdmin, deleteUserById)
router.put("/:id", authMiddleware, isAdmin, updateUserById)

router.put("/block/:id", authMiddleware, isAdmin, blockUser)
router.put("/unblock/:id", authMiddleware, isAdmin, unblockUser)

router.put("/pwd-update/:id", authMiddleware, updatePassword)

module.exports = router