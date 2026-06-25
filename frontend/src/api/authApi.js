import axiosInstance from "./axiosInstance";

export const registerUserApi = async (formData) => {
  const response = await axiosInstance.post("/auth/register", formData);
  return response.data;
};

export const loginUserApi = async (formData) => {
  const response = await axiosInstance.post("/auth/login", formData);
  return response.data;
};

export const getMeApi = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};