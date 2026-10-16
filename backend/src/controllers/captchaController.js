const {
    getCurrentChallenge,
    verifyChallenge,
    claimReward,
    createNewChallenge
} = require("../services/captchaService");


// ========================================
// GET CURRENT CAPTCHA
// ========================================
const getCurrentCaptcha = async (req, res) => {

    try {

        const userId = req.user._id;

        const challenge =
            await getCurrentChallenge(userId);


        // IMPORTANT:
        // Only send safe fields to frontend.
        //
        // Never send:
        // - correctOption
        // - captchaText
        // - userId
        // - internal DB fields
        // - reward information before verification

        return res.status(200).json({

            success: true,

            challengeId:
                challenge.challengeId,

            question:
                "Enter the correct CAPTCHA shown in the image.",

            captchaImage:
                challenge.captchaImage,

            options:
                challenge.options,

            expiresAt:
                challenge.expiresAt
        });


    } catch (error) {

        console.error(
            "Get current CAPTCHA error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load CAPTCHA"
        });
    }
};


// ========================================
// VERIFY CAPTCHA
// ========================================
const verifyCaptcha = async (req, res) => {

    try {

        const userId = req.user._id;

        const {
            challengeId,
            selectedOption
        } = req.body;


        // Basic validation
        if (!challengeId) {

            return res.status(400).json({

                success: false,

                message:
                    "challengeId is required"
            });
        }


        if (!selectedOption) {

            return res.status(400).json({

                success: false,

                message:
                    "selectedOption is required"
            });
        }


        const result =
            await verifyChallenge(
                userId,
                challengeId,
                selectedOption
            );


        return res
            .status(result.statusCode)
            .json(result);


    } catch (error) {

        console.error(
            "Verify CAPTCHA error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to verify CAPTCHA"
        });
    }
};


// ========================================
// CLAIM REWARD
// ========================================
const claimCaptchaReward = async (
    req,
    res
) => {

    try {

        const userId = req.user._id;

        const {
            challengeId
        } = req.body;


        if (!challengeId) {

            return res.status(400).json({

                success: false,

                message:
                    "challengeId is required"
            });
        }


        const result =
            await claimReward(
                userId,
                challengeId
            );


        return res
            .status(result.statusCode)
            .json(result);


    } catch (error) {

        console.error(
            "Claim reward error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to claim reward"
        });
    }
};


// ========================================
// CREATE NEW CAPTCHA
// ========================================
const newCaptcha = async (req, res) => {

    try {

        const userId = req.user._id;

        const {
            oldChallengeId
        } = req.body;


        const challenge =
            await createNewChallenge(
                userId,
                oldChallengeId
            );


        // Again, only safe fields
        // are returned.

        return res.status(201).json({

            success: true,

            challengeId:
                challenge.challengeId,

            question:
                "Enter the correct CAPTCHA shown in the image.",

            captchaImage:
                challenge.captchaImage,

            options:
                challenge.options,

            expiresAt:
                challenge.expiresAt
        });


    } catch (error) {

        console.error(
            "New CAPTCHA error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to create new CAPTCHA"
        });
    }
};


module.exports = {

    getCurrentCaptcha,

    verifyCaptcha,

    claimCaptchaReward,

    newCaptcha

};