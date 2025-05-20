
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET);


// 🔗 Route Imports
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const chatbotRoutes = require("./routes/chatbot");
const paymentRoutes = require("./routes/payment");

const app = express();

// 🧠 Log all incoming requests (optional: can be replaced by a more advanced logger like winston)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 🛡️ Middleware
app.use(express.json());  // Parse incoming JSON bodies
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // ✅ Add PATCH here
  credentials: true
}));


// 🚀 Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/payment", paymentRoutes);

// 🌐 MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studentDB";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);  // Exit process with failure if MongoDB connection fails
});

// 🧯 Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// 🚦 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
