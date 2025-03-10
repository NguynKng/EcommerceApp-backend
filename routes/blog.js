const router = require("express").Router()
const { addBlog, getBlogs, getBlogById, updateBlogById, deleteBlogById } = require("../controllers/blog")
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")

router.post('/add', authMiddleware, isAdmin, addBlog)
router.get('', getBlogs)
router.get('/:id', getBlogById)
router.put('/:id', authMiddleware, isAdmin, updateBlogById)
router.delete('/:id', authMiddleware, isAdmin, deleteBlogById)

module.exports = router