import axiosInstance from "./axiosInstance.js";

export function login(credentials) {
  return axiosInstance.post("/auth/login", credentials).then((res) => res.data);
}

export function logout() {
  localStorage.removeItem("user");
}
