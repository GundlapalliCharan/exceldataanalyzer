require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Simple routes (signup/login/history)
const User = require("./models/User");
const History = require("./models/History");

// Signup
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  console.log("📝 Signup request:", req.body);

  try {
    // check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Username already exists" });
    }

    const user = new User({ username, password });
    await user.save();

    res.json({ success: true, message: "Signup successful!" });
  } catch (err) {
    res.status(400).json({ success: false, message: "Signup failed", details: err });
  }
});

// Login
app.post("/login", async (req, res) => {
  console.log("🔑 Login request body:", req.body);
  let { username, password } = req.body;

  username = username.trim();
  password = password.trim();

  try {
    const user = await User.findOne({ username });
    console.log("🔍 MongoDB found:", user);

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (password === user.password) {
      return res.json({
        success: true,
        message: "Login successful!",
        userId: user._id
      });
    } else {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }
  } catch (err) {
    res.status(400).json({ success: false, message: "Login failed", details: err });
  }
});


// Save history
app.post("/history", async (req, res) => {
  const { userId, fileName, chartType, xAxis, yAxis } = req.body;
  try {
    const history = new History({ userId, fileName, chartType, xAxis, yAxis });
    await history.save();
    res.json({ message: "History saved!" });
  } catch (err) {
    res.status(400).json({ error: "Failed to save history", details: err });
  }
});

// Get history by user
app.get("/history/:userId", async (req, res) => {
  try {
    const history = await History.find({ userId: req.params.userId });
    res.json(history);
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch history", details: err });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
