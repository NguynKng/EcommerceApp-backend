const mongoose = require('mongoose')

var productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        default: 0,
        required: true
    },
    images: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Image"
    }]
    ,
    color: {
        type: String,
    },
    brand: {
        type: String,
        required: true
    },
    ratings: [
        {
            star: Number,
            comment: String,
            postedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
            },
            updatedAt: {
                type: Date,
            }
        }
    ],
    totalRating: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

module.exports = mongoose.model('Product', productSchema)