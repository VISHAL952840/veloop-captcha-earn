const rateLimit = require("express-rate-limit");

const captchaRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute

    max: 30, // maximum 30 requests per minute

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many CAPTCHA requests. Please try again later."
    }
});

module.exports = captchaRateLimiter;