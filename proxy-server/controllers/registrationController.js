import ProxySetting from "../models/ProxySetting.js";
import { encrypt, decrypt } from "../utils/encryption.js";
import axios from "axios";

/**
 * Saves the initial provision key and exam center ID
 */
export const saveProvisionKey = async (req, res) => {
    const { exam_center_id, provision_key, main_server_url } = req.body;

    if (!exam_center_id || !provision_key) {
        return res.status(400).json({ error: "exam_center_id and provision_key are required" });
    }

    try {
        let setting = await ProxySetting.findOne();
        if (setting) {
            await setting.update({
                exam_center_id,
                provision_key: encrypt(provision_key),
                main_server_url: main_server_url || setting.main_server_url,
            });
        } else {
            setting = await ProxySetting.create({
                exam_center_id,
                provision_key: encrypt(provision_key),
                main_server_url: main_server_url || "http://localhost:8000",
            });
        }

        res.status(200).json({ message: "Provision key saved locally" });
    } catch (err) {
        res.status(500).json({ error: "Error saving provision key: " + err.message });
    }
};

/**
 * Registers with the Main Server to get the secret key
 */
export const registerWithMainServer = async (req, res) => {
    try {
        const setting = await ProxySetting.findOne();
        if (!setting || !setting.provision_key) {
            return res.status(400).json({ error: "Provision key not found locally. Save it first." });
        }

        const provision_key = decrypt(setting.provision_key);
        const main_server_url = setting.main_server_url;

        const response = await axios.post(`${main_server_url}/proxy/register-exam-center`, {
            exam_center_id: setting.exam_center_id,
            provision_key,
        });

        const { secret_key } = response.data;

        await setting.update({
            secret_key: encrypt(secret_key),
            provision_key: null, // Clear provision key after successful registration
        });

        res.status(200).json({ message: "Registered with Main Server successfully" });
    } catch (err) {
        const errorMsg = err.response?.data?.error || err.message;
        res.status(500).json({ error: "Registration failed: " + errorMsg });
    }
};

/**
 * Checks if the proxy node is already registered
 */
export const getRegistrationStatus = async (req, res) => {
    try {
        const setting = await ProxySetting.findOne();
        const is_registered = !!(setting && setting.secret_key);
        res.status(200).json({ 
            is_registered, 
            selected_examination_id: setting?.selected_examination_id || null,
            selected_subject_id: setting?.selected_subject_id || null
        });
    } catch (err) {
        res.status(500).json({ error: "Error checking status: " + err.message });
    }
};
