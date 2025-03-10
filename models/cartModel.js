const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true, default: 1 },
            price: { type: Number, required: true }, // Stores price at time of adding to cart
        }
    ],
    total: { 
        type: Number, 
        default: 0 
    },
    orderBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })

module.exports = mongoose.model('Cart', cartSchema)