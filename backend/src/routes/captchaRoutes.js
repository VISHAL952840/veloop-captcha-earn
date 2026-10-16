const express = require("express");

const router = express.Router();

const protect =
    require("../middleware/authMiddleware");

const captchaRateLimiter =
    require("../middleware/rateLimiter");

const {
    getCurrentCaptcha,
    verifyCaptcha,
    claimCaptchaReward,
    newCaptcha
} = require("../controllers/captchaController");


router.get(
    "/current",
    protect,
    captchaRateLimiter,
    getCurrentCaptcha
);

router.post(
    "/verify",
    protect,
    captchaRateLimiter,
    verifyCaptcha
);

router.post(
    "/claim",
    protect,
    captchaRateLimiter,
    claimCaptchaReward
);

router.post(
    "/new",
    protect,
    captchaRateLimiter,
    newCaptcha
);


module.exports = router;