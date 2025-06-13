const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        count: {
            type: Number,
            required: true,
            min: 1
        },
        price: { // ✅ Store product price at the time of order
            type: Number,
            required: true
        }
    }],
    total: { // ✅ Store the total order price
        type: Number,
        required: true
    },
    address: { // ✅ Shipping Address
        fullName: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String, required: true }
    },
    paymentIntent: { // ✅ Payment Details
        id: String,
        amount: Number,
        currency: String,
        status: String,
        method: String
    },
    orderStatus: {
        type: String,
        enum: ['Not Processed', 'Processing', 'Cash on Delivery', 'Dispatched', 'Cancelled', 'Delivered'],
        default: 'Not Processed',
        required: true
    },
    orderBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
