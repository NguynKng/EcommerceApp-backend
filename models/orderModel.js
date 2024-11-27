const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        count: Number,
        color: String
    }],
    paymentIntent:{},
    orderStatus: {
        type: String,
        enum: ['Not Processed', 'Processing', 'Cash on Delivery', 'Dispatched', 'Cancelled', 'Delivered'],
        default: 'Not Processed'
    },
    orderBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)