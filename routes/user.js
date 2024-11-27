const router = require("express").Router()
const { getUser, getUserById, deleteUserById, updateUserById, blockUser, unblockUser, updatePassword, getWishList, userCart, getUserCart, emptyCart, applyCoupon, createOrder, getOrder, updateOrder } = require("../controllers/user")
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")

router.get("/", authMiddleware, isAdmin, getUser)

router.get("/wishlist", authMiddleware, getWishList)

router.get("/cart", authMiddleware, getUserCart)
router.delete("/cart", authMiddleware, emptyCart)
router.post("/cart", authMiddleware, userCart)
router.post("/cart/apply-coupon", authMiddleware, applyCoupon)

router.post("/order", authMiddleware, createOrder)
router.get("/order", authMiddleware, getOrder)
router.put("/order/:id", authMiddleware, isAdmin, updateOrder)


router.get("/:id", authMiddleware, isAdmin, getUserById)
router.delete("/:id", authMiddleware, isAdmin, deleteUserById)
router.put("/:id", authMiddleware, isAdmin, updateUserById)

router.put("/block/:id", authMiddleware, isAdmin, blockUser)
router.put("/unblock/:id", authMiddleware, isAdmin, unblockUser)

router.put("/pwd-update/:id", authMiddleware, updatePassword)

module.exports = router