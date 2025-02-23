const router = require("express").Router()
const { addBrand, getBrand, deleteBrand, updateBrandById, getBrandById } = require('../controllers/brand')
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")

router.post('/add', authMiddleware, isAdmin, addBrand)
router.get('', authMiddleware, isAdmin, getBrand)
router.delete('/:id', authMiddleware, isAdmin, deleteBrand)
router.put('/:id', authMiddleware, isAdmin, updateBrandById)
router.get('/:id', authMiddleware, isAdmin, getBrandById)


module.exports = router