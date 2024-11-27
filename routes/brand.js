const router = require("express").Router()
const { addBrand, getBrand, deleteBrand } = require('../controllers/brand')
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")

router.post('/add', authMiddleware, isAdmin, addBrand)
router.get('', authMiddleware, isAdmin, getBrand)
router.delete('/:id', authMiddleware, isAdmin, deleteBrand)

module.exports = router