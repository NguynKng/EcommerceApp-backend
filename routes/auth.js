const router = require("express").Router()
const { signup, loginUser, logout, loginAdmin, authCheck } = require("../controllers/auth")
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")

router.post("/signup", signup)
router.post("/login", loginUser)
router.post("/logout", logout)
router.post("/admin-login", loginAdmin)
router.get("/authCheck", authMiddleware, isAdmin, authCheck)

module.exports = router