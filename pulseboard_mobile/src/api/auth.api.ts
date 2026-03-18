import api from "./client";

export const registerUser = async (userData: object) => {
  const response = await api.post("/auth/register", userData); 
  return response.data;
};

export const verifyOtp = async (data: { email: string; otp: string }) => {
  const response = await api.post("/auth/verify-otp", data);
  return response.data;
};

export const resendOtp = async (data: { email: string }) => {
  const response = await api.post("/auth/resend-otp", data);
  return response.data;
};

export const googleLogin = async (code: string) => {
  const response = await api.post("/auth/google/callback", { code });
  return response.data;
};