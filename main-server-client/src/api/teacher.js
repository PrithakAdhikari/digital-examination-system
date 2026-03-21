import axiosInstance from "./axiosInstance.js";

const teacher = "/teacher";

export function getTeacherExamSummary() {
  return axiosInstance.get(`${teacher}/dashboard/exam-summary`).then((res) => res.data?.data ?? res.data);
}

export function getTeacherUpcomingExaminations(params = {}) {
  return axiosInstance
    .get(`${teacher}/dashboard/upcoming-examinations`, { params: { limit: params.limit ?? 6 } })
    .then((res) => res.data?.data ?? res.data);
}

export function getTeacherTopStudents(params = {}) {
  return axiosInstance
    .get(`${teacher}/dashboard/top-students`, { params: { limit: params.limit ?? 3 } })
    .then((res) => res.data?.data ?? res.data);
}

export function getTeacherAverageResultsOverExaminations() {
  return axiosInstance
    .get(`${teacher}/dashboard/average-results-over-examinations`)
    .then((res) => res.data?.data ?? res.data);
}
