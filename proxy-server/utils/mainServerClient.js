import axios from "axios";
import crypto from "crypto";
import ProxySetting from "../models/ProxySetting.js";
import { decrypt } from "./encryption.js";

const mainServerClient = axios.create();

mainServerClient.interceptors.request.use(async (config) => {
    try {
        const setting = await ProxySetting.findOne();
        if (!setting || !setting.secret_key) {
            return config;
        }

        const secretKey = decrypt(setting.secret_key);
        const centerId = setting.exam_center_id;
        const timestamp = Date.now().toString();
        const method = config.method.toUpperCase();
        const path = new URL(config.url, config.baseURL).pathname;
        const body = config.data ? JSON.stringify(config.data) : "";

        const message = `${method}${path}${timestamp}${body}`;
        const signature = crypto
            .createHmac("sha256", secretKey)
            .update(message)
            .digest("hex");

        config.headers["x-exam-center-id"] = centerId;
        config.headers["x-hmac-signature"] = signature;
        config.headers["x-timestamp"] = timestamp;

        if (!config.baseURL && setting.main_server_url) {
            config.baseURL = setting.main_server_url;
        }

        return config;
    } catch (err) {
        console.error("Error in HMAC interceptor:", err);
        return config;
    }
});

export default mainServerClient;
