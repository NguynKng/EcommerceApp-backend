const router = require("express").Router()
const { getCoupon, updateCouponById, addCoupon, deleteCouponById, getCouponById } = require("../controllers/coupon")
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")

router.get('', authMiddleware, getCoupon)
router.post("/add", authMiddleware, isAdmin, addCoupon)
router.put("/:id", authMiddleware, isAdmin, updateCouponById)
router.delete("/:id", authMiddleware, isAdmin, deleteCouponById)
router.get("/:id", authMiddleware, getCouponById)

module.exports = router
