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

export function selectExamination({ examId, subjectId, startTime }) {
    return axiosInstance.post("/select-examination", { examId, subjectId, startTime }).then((res) => res.data);
}

export function removeExamination() {
    return axiosInstance.post("/remove-examination").then((res) => res.data);
}

export function getQuestions() {
    return axiosInstance.get("/questions").then((res) => res.data);
}

export function runCode({ language, code }) {
    return axiosInstance.post("/run-code", { language, code }).then((res) => res.data);
}

export function getClients() {
    return axiosInstance.get("/clients").then((res) => res.data);
}

export function deleteClient(clientId) {
    return axiosInstance.delete(`/clients/${clientId}`).then((res) => res.data);
}

export function syncAnswers() {
    return axiosInstance.post("/sync-answers").then((res) => res.data);
}

export function getUnsyncedAnswers() {
    return axiosInstance.get("/unsynced-answers").then((res) => res.data);
}

export function getUnsyncedCount() {
    return axiosInstance.get("/unsynced-count").then((res) => res.data);
}

export function getStudents() {
    return axiosInstance.get("/students").then((res) => res.data);
}

