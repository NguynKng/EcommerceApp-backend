const router = require("express").Router()
const { signup, loginUser, logout, loginAdmin, authCheck, forgotPassword, verifyCode, resetPassword } = require("../controllers/auth")
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")

router.post("/signup", signup)
router.post("/login", loginUser)
router.post("/logout", logout)
router.post("/forgot-password", forgotPassword)
router.post("/verify-code", verifyCode)
router.post("/reset-password", resetPassword)
router.post("/admin-login", loginAdmin)
router.get("/authCheck", authMiddleware, authCheck)

module.exports = router