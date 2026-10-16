const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        action: {
            type: String,
            required: true
        },

        challengeId: {
            type: String,
            default: null
        },

        details: {
            type: Object,
            default: {}
        },

        ipAddress: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "AuditLog",
    auditLogSchema
);