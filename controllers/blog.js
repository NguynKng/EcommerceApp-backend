const blogModel = require('../models/blogModel')

const addBlog = async (req, res) => {
    try {
        const { title, content, description, category } = req.body
        if (!title ||!content || !category || !description)
            return res.status(400).json({ success: false, message: 'All fields are required.' })
        
        const existingBlog = await blogModel.findOne({ title })
        if (existingBlog)
            return res.status(400).json({ success: false, message: 'A blog with the same title already exists.' })
        
        const newBlog = new blogModel({ title, content, description, category, })
        await newBlog.save()
        return res.status(201).json({ success: true, blog: newBlog })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Error in add blog.' })
    }
}

const getBlogs = async (req, res) => {
    try {
        const blogs = await blogModel.find(req.query)
        return res.status(200).json({ success: true, blogs })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Error in get blogs.' })
    }
}

const getBlogById = async (req, res) => {
    try {
        const { id } = req.params
        const blog = await blogModel.findById(id)
        if (!blog)
            return res.status(404).json({ success: false, message: 'Blog not found.' })
        
        return res.status(200).json({ success: true, blog })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Error in get blog by id.' })
    }
}

const updateBlogById = async (req, res) => {
    try {
        const { id } = req.params
        const updatedBlog = await blogModel.findByIdAndUpdate(id, req.body, { new: true })
        if (!updatedBlog)
            return res.status(404).json({ success: false, message: 'Blog not found.' })
        
        return res.status(200).json({ success: true, blog: updatedBlog })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Error in update blog by id.' })
    }
}

const deleteBlogById = async (req, res) => {
    try {
        const { id } = req.params
        const deletedBlog = await blogModel.findByIdAndDelete(id)
        if (!deletedBlog)
            return res.status(404).json({ success: false, message: 'Blog not found.' })
        
        return res.status(200).json({ success: true, message: 'Blog deleted successfully.' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Error in delete blog by id.' })
    }
}

module.exports = { addBlog, getBlogs, getBlogById, updateBlogById, deleteBlogById }