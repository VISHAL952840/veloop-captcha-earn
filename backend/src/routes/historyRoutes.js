const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
    getTransactionHistory
} = require("../controllers/historyController");

router.get("/", protect, getTransactionHistory);

module.exports = router;