const router = require("express").Router()
const { addCategory, getCategory, deleteCategory } = require('../controllers/productCat')
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")

router.post('/add', authMiddleware, isAdmin, addCategory)
router.get('', authMiddleware, isAdmin, getCategory)
router.delete('/:id', authMiddleware, isAdmin, deleteCategory)

module.exports = router