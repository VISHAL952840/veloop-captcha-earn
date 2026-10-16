const GemTransaction = require("../models/GemTransaction");

const getTransactionHistory = async (req, res) => {
    try {
        const transactions = await GemTransaction.find({
            userId: req.user._id
        })
            .sort({ createdAt: -1 })
            .select(
                "transactionId amount type source referenceId balanceBefore balanceAfter status createdAt"
            );

        return res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });

    } catch (error) {
        console.error("Transaction history error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getTransactionHistory
};