import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("assetflow_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const getErrorMessage = (error) => {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong. Please try again."
  );
};

export const signup = async (payload) => {
  try {
    const { data } = await authClient.post("/auth/signup", payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const login = async (payload) => {
  try {
    const { data } = await authClient.post("/auth/login", payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const forgotPassword = async (payload) => {
  try {
    const { data } = await authClient.post("/auth/forgot-password", payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const resetPassword = async (token, payload) => {
  try {
    const { data } = await authClient.put(
      `/auth/reset-password/${token}`,
      payload
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getProfile = async () => {
  try {
    const { data } = await authClient.get("/auth/me");
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export default authClient;
