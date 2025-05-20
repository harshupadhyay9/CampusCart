const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Product = require("../models/Product");

const router = express.Router();

// ✅ Get All Products (Public Route)
router.get("/", async (req, res) => {
    console.log("📢 Fetching all products...");

    try {
        const products = await Product.find({});
        console.log("✅ Products found:", products.length);

        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }

        // ✅ Convert price to number (handle strings like "₹499")
        const formattedProducts = products.map((product) => {
            let numericPrice = product.price;
            if (typeof product.price === "string") {
                numericPrice = parseFloat(product.price.replace(/[₹,]/g, "")) || 0;
            }

            return {
                ...product._doc,
                price: numericPrice,
            };
        });

        res.json(formattedProducts);
    } catch (error) {
        console.error("❌ Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// ✅ Add a New Product (Protected Route)
router.post("/", authMiddleware, async (req, res) => {
    console.log("📢 Adding a new product...");
    const { name, description, price, category, image } = req.body;

    if (!name || !description || !price || !category || !image) {
        console.log("❌ Missing required fields");
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const newProduct = new Product({ name, description, price, category, image });
        await newProduct.save();
        console.log("✅ Product added:", newProduct);
        res.status(201).json({ message: "Product added successfully", product: newProduct });
    } catch (error) {
        console.error("❌ Error adding product:", error);
        res.status(500).json({ error: "Failed to add product" });
    }
});

// ✅ Bulk Insert Products (Protected Route)
router.post("/bulk", authMiddleware, async (req, res) => {
    console.log("📢 Bulk adding products...");
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: "Products array is required" });
    }

    try {
        const insertedProducts = await Product.insertMany(products);
        console.log(`✅ ${insertedProducts.length} products inserted`);
        res.status(201).json({ message: "Bulk products added successfully", products: insertedProducts });
    } catch (error) {
        console.error("❌ Bulk insert error:", error);
        res.status(500).json({ error: "Failed to insert products" });
    }
});

module.exports = router;
