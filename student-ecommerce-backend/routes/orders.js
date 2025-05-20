const express = require("express");
const nodemailer = require("nodemailer");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Admin: Get All Orders

router.get("/admin", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const allOrders = await Order.find({}).sort({ createdAt: -1 });

    // Log the response to inspect it before sending it
    console.log("Fetched Orders:", allOrders);

    if (!allOrders || allOrders.length === 0) {
      return res.json({ success: true, message: "No orders found.", data: [] });
    }

    // Log the final response
    return res.json({
      success: true,
      message: "Orders fetched successfully.",
      data: allOrders,
    });
  } catch (error) {
    console.error("❌ Failed to fetch all orders for admin:", error);
    res.status(500).json({ error: "Failed to fetch admin orders", details: error.message });
  }
});



// ✅ Create Order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    const userId = req.user.id;

    if (!items || !totalAmount) {
      return res.status(400).json({ error: "Items and total amount are required." });
    }

    const newOrder = new Order({ userId, items, totalAmount });
    await newOrder.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.user.email,
      subject: "Order Placed Successfully!",
      text: `Dear ${req.user.name || "User"},\n\nYour order has been placed successfully!\nOrder ID: ${newOrder._id}\nTotal Amount: ₹${totalAmount}\n\nThank you for shopping with us!`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("❌ Error sending email:", error);
      } else {
        console.log("✅ Email sent: " + info.response);
      }
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      data: newOrder,
    });
  } catch (err) {
    console.error("❌ Failed to place order:", err);
    res.status(500).json({ error: "Failed to place order", details: err.message });
  }
});

// ✅ Update Order Status
router.patch("/status/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required." });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    res.json({
      success: true,
      message: "Order status updated successfully.",
      data: order,
    });
  } catch (err) {
    console.error("❌ Failed to update order status:", err);
    res.status(500).json({ error: "Failed to update order status", details: err.message });
  }
});

// ✅ Get Order Status
router.get("/:id/status", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    res.json({
      success: true,
      status: order.status,
    });
  } catch (err) {
    console.error("❌ Failed to fetch order status:", err);
    res.status(500).json({ error: "Failed to fetch order status", details: err.message });
  }
});

// ✅ Get All Orders of a User
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this user." });
    }

    res.json({
      success: true,
      data: orders,
    });
  } catch (err) {
    console.error("❌ Failed to fetch orders for user:", err);
    res.status(500).json({ error: "Failed to fetch orders", details: err.message });
  }
});

// ✅ Get Order Bill
router.get("/bill/:orderId", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("userId", "name email");
    if (!order) return res.status(404).json({ message: "Order not found." });

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.error("❌ Failed to fetch bill:", err.message);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

module.exports = router;
