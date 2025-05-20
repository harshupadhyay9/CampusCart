const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// 📌 JWT Generator
const generateToken = (user) => {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error("JWT secret key not found in environment variables.");
  }

  return jwt.sign({ id: user._id, role: user.role }, secretKey, {
    expiresIn: "7d",
  });
};

/**
 * 📧 Unified Email/Password Auth
 * mode: 'login' | 'register'
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, password, mode, role = "student" } = req.body;

    if (!email || !password || !mode) {
      return res.status(400).json({ message: "Email, password, and mode are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (mode === "register") {
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
      if (!name) {
        return res.status(400).json({ message: "Name is required for registration" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, email: normalizedEmail, password: hashedPassword, role });
      await newUser.save();

      const token = generateToken(newUser);
      return res.status(201).json({
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    }

    if (mode === "login") {
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(existingUser);
      return res.status(200).json({
        token,
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
        },
      });
    }

    return res.status(400).json({ message: "Invalid mode. Use 'login' or 'register'." });
  } catch (error) {
    console.error("🔴 Email Auth Error:", error.message, error.stack);

    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 📲 Send OTP (Login/Register via Mobile)
 */
router.post("/send-otp", async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ message: "Mobile number is required." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    let user = await User.findOne({ mobile });

    if (!user) {
      user = new User({
        mobile,
        name: "Mobile User",
        role: "student",
      });
    }

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // TODO: Integrate actual SMS service (e.g., Twilio or Fast2SMS)
    if (process.env.NODE_ENV !== "production") {
      console.log(`📲 OTP for ${mobile}: ${otp}`);
    }

    res.json({ message: "OTP sent to mobile." });
  } catch (err) {
    console.error("🔴 Send OTP Error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

/**
 * ✅ Verify OTP & Login/Register
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) {
      return res.status(400).json({ message: "Mobile number and OTP are required." });
    }

    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: "User not found" });

    const now = new Date();
    if (!user.otp || user.otp !== otp || user.otpExpires < now) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP fields
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("🔴 Verify OTP Error:", err);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
});

module.exports = router;
