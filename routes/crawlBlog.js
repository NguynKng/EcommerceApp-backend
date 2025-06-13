const router = require("express").Router()
const { crawlBlog } = require("../controllers/crawlBlog")

router.get('', crawlBlog)

module.exports = router