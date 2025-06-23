const router = require("express").Router()
const { addProduct, getProductByID, getProduct, getCrawlData, getProductBySlug, updateProductById, deleteProductById, getFeaturedCollections, getSpecialProduct, getPopularProduct, getAllProduct } = require('../controllers/product')
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")

router.get('', getProduct)
router.post('/add', addProduct)
router.get('/:id', getProductByID)
router.get('/slug/:slug', getProductBySlug)
router.put('/:id', authMiddleware, isAdmin, updateProductById)
router.delete('/:id', authMiddleware, isAdmin, deleteProductById)
router.get("/crawl/data", getCrawlData)
router.get("/get/featured-collection", getFeaturedCollections)
router.get("/get/special-product", getSpecialProduct)
router.get("/get/popular-product", getPopularProduct)
router.get("/get/all", authMiddleware, isAdmin, getAllProduct)

module.exports = router