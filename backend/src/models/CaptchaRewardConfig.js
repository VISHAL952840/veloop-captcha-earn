const mongoose = require("mongoose");

const captchaRewardConfigSchema = new mongoose.Schema(
    {
        correctReward: {
            type: Number,
            required: true,
            min: 0,
            default: 1
        },

        wrongReward: {
            type: Number,
            required: true,
            min: 0,
            default: 0.5
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "CaptchaRewardConfig",
    captchaRewardConfigSchema
);