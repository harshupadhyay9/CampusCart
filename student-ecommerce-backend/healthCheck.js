// healthCheck.js
const axios = require('axios');

const API_BASE = "http://localhost:5000/api";

async function testAuth() {
  try {
    console.log("✅ Testing Auth (registering test user)...");

    const registerResponse = await axios.post(`${API_BASE}/auth`, {
      name: "Test User",
      email: "testuser@example.com",
      password: "test1234",
      mode: "register",
      role: "student", // or "admin" if you want
    });

    console.log("✅ Registered successfully:", registerResponse.data);

    console.log("✅ Now testing Login...");

    const loginResponse = await axios.post(`${API_BASE}/auth`, {
      email: "testuser@example.com",
      password: "test1234",
      mode: "login",
    });

    console.log("✅ Login successful:", loginResponse.data);
    console.log("🎯 JWT Token generated:", loginResponse.data.token);

  } catch (error) {
    console.error("❌ Health Check Failed:", error.response?.data || error.message);
  }
}

testAuth();
