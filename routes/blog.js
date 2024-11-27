const router = require("express").Router()
const { addBlog, getBlogs, getBlogById, updateBlogById, deleteBlogById } = require("../controllers/blog")
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")

router.post('/add', authMiddleware, isAdmin, addBlog)
router.get('', authMiddleware, isAdmin, getBlogs)
router.get('/:id', authMiddleware, isAdmin, getBlogById)
router.put('/:id', authMiddleware, isAdmin, updateBlogById)
router.delete('/:id', authMiddleware, isAdmin, deleteBlogById)

module.exports = router