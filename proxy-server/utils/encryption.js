import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 12 bytes for GCM
const AUTH_TAG_LENGTH = 16;
// On Proxy, we use a local secret for encryption
const KEY = crypto.scryptSync(process.env.PROXY_SECRET_KEY || "proxy_default_secret", "proxy_salt", 32);

/**
 * Encrypts text using AES-256-GCM
 * @param {string} text 
 * @returns {string} iv:authTag:encryptedText
 */
export const encrypt = (text) => {
    if (!text) return null;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const authTag = cipher.getAuthTag().toString("hex");
    
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
};

/**
 * Decrypts text using AES-256-GCM
 * @param {string} encryptedWithIvAndTag iv:authTag:encryptedText
 * @returns {string} decryptedText
 */
export const decrypt = (encryptedWithIvAndTag) => {
    if (!encryptedWithIvAndTag) return null;
    const [ivHex, authTagHex, encryptedText] = encryptedWithIvAndTag.split(":");
    
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
};

/**
 * Generates an HMAC signature for the given text
 * @param {string} text 
 * @returns {string} hex signature
 */
export const generateSignature = (text) => {
    if (!text) return null;
    return crypto.createHmac("sha256", process.env.SECRET_KEY || "proxy_default_hmac_secret")
        .update(text)
        .digest("hex");
};

/**
 * Verifies an HMAC signature
 * @param {string} text 
 * @param {string} signature 
 * @returns {boolean}
 */
export const verifySignature = (text, signature) => {
    if (!text || !signature) return false;
    const expected = generateSignature(text);
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
};
