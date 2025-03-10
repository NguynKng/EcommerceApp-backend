const router = require("express").Router()
const { addCategory, getCategory, deleteCategory} = require('../controllers/blogCat')
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")

router.post('/add', authMiddleware, isAdmin, addCategory)
router.get('', getCategory)
router.delete('/:id', authMiddleware, isAdmin, deleteCategory)

module.exports = router