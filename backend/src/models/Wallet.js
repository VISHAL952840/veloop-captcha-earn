const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        gems: {
            type: Number,
            default: 100,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Wallet", walletSchema);