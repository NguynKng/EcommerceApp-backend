const router = require("express").Router()
const { addProduct, getProductByID, getProduct, getProductBySlug, updateProductById, deleteProductById } = require('../controllers/product')
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")
const { productImgResize } = require("../middlewares/uploadImg")

router.get('', getProduct)
router.post('/add', authMiddleware, isAdmin, addProduct)
router.get('/:id', getProductByID)
router.get('/slug/:slug', getProductBySlug)
router.put('/:id', authMiddleware, isAdmin, updateProductById)
router.delete('/:id', authMiddleware, isAdmin, deleteProductById)

module.exports = router