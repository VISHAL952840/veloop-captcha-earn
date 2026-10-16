const mongoose = require("mongoose");

const captchaChallengeSchema = new mongoose.Schema(
    {
        challengeId: {
            type: String,
            required: true,
            unique: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        captchaText: {
            type: String,
            required: true
        },

        captchaImage: {
            type: String,
            required: true
     },

        options: {
            type: [String],
            required: true,
            validate: {
                validator: function (value) {
                    return value.length === 4;
                },
                message: "CAPTCHA must have exactly 4 options"
            }
        },

        correctOption: {
            type: String,
            required: true,
            select: false
        },

       status: {
    type: String,
    enum: [
        "ACTIVE",
        "PROCESSING",
        "COMPLETED",
        "DISCARDED",
        "EXPIRED"
    ],
    default: "ACTIVE"
},

        expiresAt: {
            type: Date,
            required: true
        },

        selectedOption: {
            type: String,
            default: null
        },

        result: {
            type: String,
            enum: ["CORRECT", "WRONG", null],
            default: null
        },

        rewardAmount: {
            type: Number,
            default: 0
        },

        rewardStatus: {
            type: String,
            enum: ["PENDING", "CLAIMED", null],
            default: null
        },

        completedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "CaptchaChallenge",
    captchaChallengeSchema
);