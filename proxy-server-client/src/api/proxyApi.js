import axiosInstance from "./axiosInstance.js";

export function saveProvisionKey(payload) {
  return axiosInstance.post("/auth/save-provision-key", payload).then((res) => res.data);
}

export function registerWithMainServer() {
  return axiosInstance.post("/auth/register-with-main").then((res) => res.data);
}

export function getRegistrationStatus() {
    return axiosInstance.get("/auth/registration-status").then((res) => res.data);
}
