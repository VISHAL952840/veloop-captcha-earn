const express = require("express");
const cors = require("cors");
require("dotenv").config();

const historyRoutes = require("./src/routes/historyRoutes");
const walletRoutes = require("./src/routes/walletRoutes");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const captchaRoutes = require("./src/routes/captchaRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/captcha", captchaRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/history", historyRoutes);
connectDB();

app.get("/", (req, res) => {
    res.json({
        message: "VELoop CAPTCHA Earn API is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});