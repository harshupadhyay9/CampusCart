const Order = require("../models/orderModel");
const sendEmail = require("../services/emailService");

const placeOrder = async (req, res) => {
  try {
    // Ensure user object has required fields
    const { id: userId, email } = req.user || {};
    if (!userId || !email) {
      return res.status(400).json({ message: "User not authenticated properly." });
    }

    // Validate order input
    const { totalAmount, items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0 || !totalAmount) {
      return res.status(400).json({ message: "Invalid order data." });
    }

    // Create the order
    const order = await Order.create({
      userId,
      totalAmount,
      items,
      status: "pending",
    });

    // Generate bill HTML
    const htmlContent = `
      <h1>🧾 Invoice for Order #${order._id}</h1>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      <table style="width:100%; border-collapse: collapse;" border="1">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px;">Product</th>
            <th style="padding: 8px;">Price</th>
            <th style="padding: 8px;">Quantity</th>
            <th style="padding: 8px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map(
              (item) => `
            <tr>
              <td style="padding: 8px;">${item.name}</td>
              <td style="padding: 8px;">₹${item.price}</td>
              <td style="padding: 8px;">${item.quantity || 1}</td>
              <td style="padding: 8px;">₹${item.price * (item.quantity || 1)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      <h3 style="margin-top: 20px;">Total Payable: <span style="color: green;">₹${order.totalAmount}</span></h3>
    `;

    // Send invoice email
    await sendEmail(email, "🧾 Your CampusCart Invoice", htmlContent);

    console.log(`✅ Order placed & invoice sent to ${email}`);

    res.status(200).json({ message: "Order placed and invoice emailed!", order });
  } catch (err) {
    console.error("❌ Error placing order:", err);
    res.status(500).json({ message: "Server error while placing order." });
  }
};

module.exports = { placeOrder };
