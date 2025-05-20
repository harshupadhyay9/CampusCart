const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    category: String, // ✅ Fixed comma here
    image: String      // ✅ This is now valid
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
