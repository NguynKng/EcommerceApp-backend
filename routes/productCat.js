const router = require("express").Router()
const { addCategory, getCategory, deleteCategory, getCategoryById, updateCategoryById } = require('../controllers/productCat')
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")

router.post('/add', authMiddleware, isAdmin, addCategory)
router.get('', getCategory)
router.delete('/:id', authMiddleware, isAdmin, deleteCategory)
router.get('/:id', authMiddleware, isAdmin, getCategoryById)
router.put('/:id', authMiddleware, isAdmin, updateCategoryById)

module.exports = router