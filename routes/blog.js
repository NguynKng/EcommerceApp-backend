const router = require("express").Router()
const { addBlog, getBlogs, getBlogById, updateBlogById, deleteBlogById, getTechNews } = require("../controllers/blog")
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")

router.post('/add', authMiddleware, isAdmin, addBlog)
router.get('/tech-news', getTechNews)
router.get('', getBlogs)
router.put('/:id', authMiddleware, isAdmin, updateBlogById)
router.delete('/:id', authMiddleware, isAdmin, deleteBlogById)

module.exports = router