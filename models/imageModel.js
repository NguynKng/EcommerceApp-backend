const mongoose = require('mongoose');

// Define a sub-schema for images
const imageSchema = new mongoose.Schema({
    path: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['thumbnail', 'additional'], // You can adjust the allowed types as needed
        required: true,
    },
    slug: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Image", imageSchema)