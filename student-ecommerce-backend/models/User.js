const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, sparse: true }, // allow mobile-only users
  password: String,
  mobile: { type: String, unique: true, sparse: true }, // optional but must be unique if used
  otp: String,
  otpExpires: Date,
  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student",
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
