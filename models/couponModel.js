const mongoose = require('mongoose')

var couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    discount: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    }
})

module.exports = mongoose.model('Coupon', couponSchema);