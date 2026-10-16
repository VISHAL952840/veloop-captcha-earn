const Wallet = require("../models/Wallet");

const getWallet = async (req, res) => {
    try {
        const wallet = await Wallet.findOne({
            userId: req.user._id
        });

        if (!wallet) {
            return res.status(404).json({
                message: "Wallet not found"
            });
        }

        return res.status(200).json({
            success: true,
            gems: wallet.gems
        });

    } catch (error) {
        console.error("Get wallet error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getWallet
};