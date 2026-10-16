const { v4: uuidv4 } = require("uuid");

const Wallet = require("../models/Wallet");
const GemTransaction = require("../models/GemTransaction");

const grantReward = async (
    userId,
    rewardAmount,
    challengeId,
    session
) => {

    // Check whether reward for this challenge is already granted
    const existingTransaction =
        await GemTransaction.findOne({
            userId,
            referenceId: challengeId,
            type: "CAPTCHA_REWARD",
            status: "COMPLETED"
        }).session(session);

    if (existingTransaction) {
        return {
            reward: existingTransaction.amount,
            balanceBefore:
                existingTransaction.balanceBefore,
            balanceAfter:
                existingTransaction.balanceAfter,
            transactionId:
                existingTransaction.transactionId
        };
    }

    const wallet = await Wallet.findOne({
        userId
    }).session(session);

    if (!wallet) {
        throw new Error("Wallet not found");
    }

    const balanceBefore = wallet.gems;
    const balanceAfter =
        balanceBefore + rewardAmount;

    // Update wallet
    wallet.gems = balanceAfter;

    await wallet.save({ session });

    // Create transaction
    const transaction =
        await GemTransaction.create(
            [
                {
                    transactionId: uuidv4(),
                    userId,
                    amount: rewardAmount,
                    type: "CAPTCHA_REWARD",
                    source: "CAPTCHA",
                    referenceId: challengeId,
                    balanceBefore,
                    balanceAfter,
                    status: "COMPLETED"
                }
            ],
            { session }
        );

    return {
        reward: rewardAmount,
        balanceBefore,
        balanceAfter,
        transactionId:
            transaction[0].transactionId
    };
};

module.exports = {
    grantReward
};