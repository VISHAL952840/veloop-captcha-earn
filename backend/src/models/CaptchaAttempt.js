const mongoose = require("mongoose");

const captchaAttemptSchema = new mongoose.Schema(
    {
        challengeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CaptchaChallenge",
            required: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        selectedOption: {
            type: String,
            required: true
        },

        result: {
            type: String,
            enum: ["CORRECT", "WRONG"],
            required: true
        },

        rewardAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        attemptedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "CaptchaAttempt",
    captchaAttemptSchema
);