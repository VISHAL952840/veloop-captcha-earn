const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { getWallet } = require("../controllers/walletController");

router.get("/", protect, getWallet);

module.exports = router;