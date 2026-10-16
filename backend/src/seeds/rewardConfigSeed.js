const mongoose = require("mongoose");
const dotenv = require("dotenv");

const CaptchaRewardConfig = require("../models/CaptchaRewardConfig");

dotenv.config();

const seedRewardConfig = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const existingConfig =
            await CaptchaRewardConfig.findOne({
                isActive: true
            });

        if (existingConfig) {
            console.log("Reward configuration already exists");
            process.exit(0);
        }

        await CaptchaRewardConfig.create({
            correctReward: 1,
            wrongReward: 0.5,
            isActive: true
        });

        console.log("Reward configuration created successfully");

        process.exit(0);

    } catch (error) {
        console.error(
            "Reward config seed error:",
            error.message
        );

        process.exit(1);
    }
};

seedRewardConfig();