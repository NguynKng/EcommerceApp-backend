const mongoose = require('mongoose');

var resetTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // Token will expire after 1 hour
    },
})

module.exports = mongoose.model("ResetToken", resetTokenSchema);