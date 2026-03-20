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

export function getExaminations() {
    return axiosInstance.get("/examinations").then((res) => res.data);
}

export function selectExamination({ examId, startTime }) {
    return axiosInstance.post("/select-examination", { examId, startTime }).then((res) => res.data);
}

export function removeExamination() {
    return axiosInstance.post("/remove-examination").then((res) => res.data);
}

export function getQuestions() {
    return axiosInstance.get("/questions").then((res) => res.data);
}
