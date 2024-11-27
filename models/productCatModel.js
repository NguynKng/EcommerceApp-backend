const mongoose = require('mongoose');

var productCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
})

module.exports = mongoose.model('productCategory', productCategorySchema);