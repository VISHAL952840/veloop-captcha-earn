const mongoose = require("mongoose");

const gemTransactionSchema = new mongoose.Schema(
    {
        transactionId: {
            type: String,
            required: true,
            unique: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        amount: {
            type: Number,
            required: true
        },

        type: {
            type: String,
            enum: ["CAPTCHA_REWARD"],
            required: true
        },

        source: {
            type: String,
            default: "CAPTCHA"
        },

        referenceId: {
            type: String,
            required: true
        },

        balanceBefore: {
            type: Number,
            required: true
        },

        balanceAfter: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ["PENDING", "COMPLETED", "FAILED"],
            default: "COMPLETED"
        }
    },
    {
        timestamps: true
    }
);

gemTransactionSchema.index(
    {
        userId: 1,
        referenceId: 1,
        type: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "GemTransaction",
    gemTransactionSchema
);