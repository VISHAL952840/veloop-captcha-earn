const {
    generateCaptchaImage
} = require("./captchaImageService");

const AuditLog = require("../models/AuditLog");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

const CaptchaAttempt = require("../models/CaptchaAttempt");
const CaptchaRewardConfig = require("../models/CaptchaRewardConfig");
const CaptchaChallenge = require("../models/CaptchaChallenge");
const { grantReward } = require("./rewardService");


// ===============================
// Generate 6-character CAPTCHA
// ===============================
const generateCaptchaText = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let captcha = "";

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(
            Math.random() * characters.length
        );

        captcha += characters[randomIndex];
    }

    return captcha;
};


// ===============================
// Shuffle options
// ===============================
const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};


// ===============================
// Create new CAPTCHA challenge
// ===============================
const createChallenge = async (userId) => {

    const captchaText = generateCaptchaText();

    const captchaImage = generateCaptchaImage(captchaText);


    // Wrong option 1
    const reverseOption = captchaText
        .split("")
        .reverse()
        .join("");


    // Wrong option 2
    let modifiedOption =
        captchaText.substring(0, 5) + "X";


    // Make sure modified option is different
    if (modifiedOption === captchaText) {
        modifiedOption =
            captchaText.substring(0, 5) + "Y";
    }


    // Wrong option 3
    let differentOption = "X4M8Q1";

    // Make sure it doesn't duplicate another option
    if (
        differentOption === captchaText ||
        differentOption === reverseOption ||
        differentOption === modifiedOption
    ) {
        differentOption = "P7K2M9";
    }


    const options = shuffleArray([
        captchaText,
        reverseOption,
        modifiedOption,
        differentOption
    ]);


    const challengeId = uuidv4();


    // CAPTCHA expires after 2 minutes
    const expiresAt = new Date(
        Date.now() + 2 * 60 * 1000
    );


    const challenge = await CaptchaChallenge.create({

        challengeId,

        userId,

        captchaText,

        captchaImage,

        options,

        // IMPORTANT:
        // This is stored in DB but NEVER exposed
        // to frontend.
        correctOption: captchaText,

        status: "ACTIVE",

        expiresAt
    });


    return challenge;
};


// ===============================
// Get current CAPTCHA
// ===============================
const getCurrentChallenge = async (userId) => {

    let challenge = await CaptchaChallenge
        .findOne({
            userId,
            status: "ACTIVE"
        })
        // IMPORTANT:
        // Do NOT select correctOption here.
        .select(
            "challengeId captchaImage options expiresAt status"
        );


    // No active CAPTCHA
    if (!challenge) {

        return await createChallenge(userId);
    }


    // Missing CAPTCHA image
    if (!challenge.captchaImage) {

        await CaptchaChallenge.updateOne(
            {
                _id: challenge._id,
                status: "ACTIVE"
            },
            {
                $set: {
                    status: "DISCARDED"
                }
            }
        );

        return await createChallenge(userId);
    }


    // CAPTCHA expired
    if (new Date() > challenge.expiresAt) {

        await CaptchaChallenge.updateOne(
            {
                _id: challenge._id,
                status: "ACTIVE"
            },
            {
                $set: {
                    status: "EXPIRED"
                }
            }
        );

        return await createChallenge(userId);
    }


    return challenge;
};


// ===============================
// Verify CAPTCHA
// ===============================
const verifyChallenge = async (
    userId,
    challengeId,
    selectedOption
) => {

    const session = await mongoose.startSession();

    let lockedChallenge = null;

    try {

        const challenge = await CaptchaChallenge
            .findOne({
                challengeId,
                userId
            })
            .select("+correctOption");

        if (!challenge) {
            return {
                success: false,
                statusCode: 404,
                message: "Challenge not found"
            };
        }

        if (challenge.status === "COMPLETED") {
            return {
                success: false,
                statusCode: 400,
                message: "Challenge already completed"
            };
        }

        if (challenge.status === "PROCESSING") {
            return {
                success: false,
                statusCode: 409,
                message:
                    "Challenge verification already in progress"
            };
        }

        if (new Date() > challenge.expiresAt) {

            await CaptchaChallenge.updateOne(
                {
                    _id: challenge._id,
                    status: "ACTIVE"
                },
                {
                    $set: {
                        status: "EXPIRED"
                    }
                }
            );

            return {
                success: false,
                statusCode: 400,
                message:
                    "Challenge expired. Please continue with a new CAPTCHA."
            };
        }

        if (!challenge.options.includes(selectedOption)) {
            return {
                success: false,
                statusCode: 400,
                message: "Invalid CAPTCHA option"
            };
        }

        // Lock challenge
         lockedChallenge =
            await CaptchaChallenge.findOneAndUpdate(
                {
                    _id: challenge._id,
                    status: "ACTIVE",
                    expiresAt: {
                        $gt: new Date()
                    }
                },
                {
                    $set: {
                        status: "PROCESSING",
                        selectedOption
                    }
                },
                {
                    returnDocument: "after"
                }
            ).select("+correctOption");

        if (!lockedChallenge) {
            return {
                success: false,
                statusCode: 409,
                message:
                    "Challenge is already being processed or completed"
            };
        }

        const isCorrect =
            selectedOption ===
            lockedChallenge.correctOption;

       const rewardConfig = await CaptchaRewardConfig.findOne({
    isActive: true
}).session(session);

if (!rewardConfig) {
    throw new Error(
        "Active CAPTCHA reward configuration not found"
    );
}

const rewardAmount = isCorrect
    ? rewardConfig.correctReward
    : rewardConfig.wrongReward;


    await CaptchaAttempt.create(
    [
        {
            challengeId: lockedChallenge._id,
            userId,
            selectedOption,
            result: isCorrect ? "CORRECT" : "WRONG",
            rewardAmount
        }
    ],
    { session }
);

await AuditLog.create(
    [
        {
            userId,
            action: "CAPTCHA_VERIFIED",
            challengeId: lockedChallenge.challengeId,
            details: {
                result: isCorrect ? "CORRECT" : "WRONG",
                reward: rewardAmount,
                selectedOption
            }
        }
    ],
    { session }
);
        let rewardData;

        // Start atomic transaction
        await session.withTransaction(async () => {

            rewardData = await grantReward(
                userId,
                rewardAmount,
                lockedChallenge.challengeId,
                session
            );

            // Complete challenge in SAME transaction
            await CaptchaChallenge.updateOne(
                {
                    _id: lockedChallenge._id,
                    status: "PROCESSING"
                },
                {
                    $set: {
                        result: isCorrect
                            ? "CORRECT"
                            : "WRONG",
                        rewardAmount,
                        rewardStatus: "PENDING",
                        status: "COMPLETED",
                        completedAt: new Date()
                    }
                },
                { session }
            );
        });

        return {
            success: true,
            statusCode: 200,
            result: isCorrect
                ? "CORRECT"
                : "WRONG",
            message: isCorrect
                ? "CAPTCHA verified successfully"
                : "That answer wasn't correct",
            reward: rewardAmount,
            balance: rewardData.balanceAfter,
            transactionId:
                rewardData.transactionId,
            challengeId:
                lockedChallenge.challengeId
        };

    } catch (error) {

        if(lockedChallenge) {}

        await CaptchaChallenge.updateOne(
            {
                  _id: lockedChallenge._id,
                userId,
                status: "PROCESSING"
            },
            {
                $set: {
                    status: "ACTIVE",
                    selectedOption: null
                }
            }
        );

        throw error;

    } finally {
        await session.endSession();
    }
};


// ===============================
// Claim reward
// ===============================
const claimReward = async (
    userId,
    challengeId
) => {

    const challenge =
        await CaptchaChallenge.findOneAndUpdate(
            {
                challengeId,
                userId,
                status: "COMPLETED",
                rewardAmount: { $gt: 0 },
                rewardStatus: { $ne: "CLAIMED" }
            },
            {
                $set: {
                    rewardStatus: "CLAIMED"
                }
            },
            {
                returnDocument: "after"
            }
        );

    // Challenge not found or claim condition failed
    if (!challenge) {

        const existingChallenge =
            await CaptchaChallenge.findOne({
                challengeId,
                userId
            });

        if (!existingChallenge) {
            return {
                success: false,
                statusCode: 404,
                message: "Challenge not found"
            };
        }

        if (existingChallenge.status !== "COMPLETED") {
            return {
                success: false,
                statusCode: 400,
                message: "Challenge is not completed"
            };
        }

        if (
            !existingChallenge.rewardAmount ||
            existingChallenge.rewardAmount <= 0
        ) {
            return {
                success: false,
                statusCode: 400,
                message: "No reward available to claim"
            };
        }

        if (
            existingChallenge.rewardStatus === "CLAIMED"
        ) {
            return {
                success: false,
                statusCode: 409,
                message: "Reward already claimed"
            };
        }

        return {
            success: false,
            statusCode: 409,
            message: "Reward could not be claimed"
        };
    }

    return {
        success: true,
        statusCode: 200,
        message: "Reward claimed successfully",
        challengeId: challenge.challengeId,
        reward: challenge.rewardAmount
    };
};


// ===============================
// Create new CAPTCHA
// ===============================
const createNewChallenge = async (
    userId,
    oldChallengeId
) => {

    if (oldChallengeId) {

        const oldChallenge =
            await CaptchaChallenge.findOne({
                challengeId: oldChallengeId,
                userId
            });


        // If user clicks "No Thanks"
        // discard the current CAPTCHA.
        if (
            oldChallenge &&
            oldChallenge.status === "ACTIVE"
        ) {

            await CaptchaChallenge.updateOne(
                {
                    _id: oldChallenge._id,
                    status: "ACTIVE"
                },

                {
                    $set: {
                        status: "DISCARDED"
                    }
                }
            );
        }
    }


    return await createChallenge(userId);
};


module.exports = {

    createChallenge,

    getCurrentChallenge,

    verifyChallenge,

    claimReward,

    createNewChallenge

};