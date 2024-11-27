const mongoose = require('mongoose');

var blogCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
})

module.exports = mongoose.model('blogCategory', blogCategorySchema);