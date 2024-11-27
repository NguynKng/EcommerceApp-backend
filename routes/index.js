const router = require("express").Router()

router.use('/user', require('./user'))
router.use('/product', require('./product'))
router.use('/auth', require('./auth'))
router.use('/blog', require('./blog'))
router.use('/blog-category', require('./blogCat'))
router.use('/product-category', require('./productCat'))
router.use('/brand', require('./brand'))
router.use('/coupon', require('./coupon'))

module.exports = router