const { createCanvas } = require("canvas");

const generateCaptchaImage = (captchaText) => {
    const width = 320;
    const height = 100;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#F8FAFC";
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    // CAPTCHA text
    ctx.font = "bold 42px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#111827";

    ctx.fillText(captchaText, width / 2, height / 2);

    // Noise lines
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(
            Math.random() * width,
            Math.random() * height
        );
        ctx.lineTo(
            Math.random() * width,
            Math.random() * height
        );

        ctx.strokeStyle = "#94A3B8";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    return canvas.toDataURL("image/png");
};

module.exports = {
    generateCaptchaImage
};