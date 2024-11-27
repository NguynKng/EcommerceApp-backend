const router = require("express").Router()
const { signup, loginUser, logout, loginAdmin } = require("../controllers/auth")

router.post("/signup", signup)
router.post("/login", loginUser)
router.post("/logout", logout)
router.post("/admin-login", loginAdmin)

module.exports = router