import crypto from "crypto";
import ExaminationCenter from "../models/ExaminationCenter.js";
import { decrypt } from "../utils/encryption.js";

/**
 * Middleware for signature verification
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
export const verifyHmacSignature = async (req, res, next) => {
    const centerId = req.headers["x-exam-center-id"];
    const signature = req.headers["x-hmac-signature"];
    const timestamp = req.headers["x-timestamp"];

    if (!centerId || !signature || !timestamp) {
        return res.status(401).json({ error: "Missing HMAC authentication headers" });
    }

    // Optional: Check timestamp freshness (e.g., within 5 minutes)
    const now = Date.now();
    const requestTime = parseInt(timestamp);
    if (isNaN(requestTime) || Math.abs(now - requestTime) > 300000) { // 5 minutes
        return res.status(401).json({ error: "Request timestamp expired or invalid" });
    }

    try {
        const center = await ExaminationCenter.findOne({ where: { exam_center_id: centerId } });
        if (!center || !center.secret_key_hash) {
            return res.status(401).json({ error: "Invalid examination center or not registered" });
        }

        // Decrypt the secret key stored in secret_key_hash field
        const secretKey = decrypt(center.secret_key_hash);

        // Reconstruct the message: method + path + timestamp + body
        // Body should be stringified if it's an object
        const body = req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : "";
        const fullPath = req.originalUrl.split("?")[0];
        const message = `${req.method}${fullPath}${timestamp}${body}`;

        // Compute HMAC
        const computedSignature = crypto
            .createHmac("sha256", secretKey)
            .update(message)
            .digest("hex");

        if (computedSignature !== signature) {
            return res.status(401).json({ error: "Invalid HMAC signature" });
        }

        // Attach center info to request
        req.examinationCenter = center;
        next();
    } catch (err) {
        res.status(500).json({ error: "Internal error during HMAC verification: " + err.message });
    }
};
