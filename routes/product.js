const router = require("express").Router()
const { addProduct, getProductByID, getProduct, updateProductById, deleteProductById, addToWishList, rating } = require('../controllers/product')
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")
const { uploadImg, productImgResize } = require("../middlewares/uploadImg")

router.get('', authMiddleware, isAdmin, getProduct)
router.post('/add', authMiddleware, isAdmin, addProduct)
router.put('/wishlist', authMiddleware, addToWishList)
router.put('/rating', authMiddleware, rating)
router.put('/upload/:id', authMiddleware, isAdmin, uploadImg.array('images', 10), productImgResize)
router.get('/:id', authMiddleware, isAdmin, getProductByID)
router.put('/:id', authMiddleware, isAdmin, updateProductById)
router.delete('/:id', authMiddleware, isAdmin, deleteProductById)

module.exports = router