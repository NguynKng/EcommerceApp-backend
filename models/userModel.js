const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "user",
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart", // ✅ Reference the Cart model instead of an array
    },
    address: String,
    wishlist: [{
        type: mongoose.ObjectId,
        ref: "Product"
    }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
