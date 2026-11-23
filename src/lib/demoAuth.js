import { axiosInstance } from "./axios";

export const registerDemoAccount = async ({ name, email, password, role }) => {
  const { data } = await axiosInstance.post("/auth/register", {
    name,
    email,
    password,
    role,
  });
  return { ...data.user, token: data.token };
};

export const authenticateDemoAccount = async ({ email, password, role }) => {
  const { data } = await axiosInstance.post("/auth/login", {
    email,
    password,
    role,
  });
  return { ...data.user, token: data.token };
};

export const createDemoPasswordReset = async (email) => {
  const { data } = await axiosInstance.post("/auth/password-reset/request", { email });
  return data.resetToken;
};

export const isDemoPasswordResetValid = async (token) => {
  if (!token) return false;
  const { data } = await axiosInstance.get(
    `/auth/password-reset/${encodeURIComponent(token)}`
  );
  return data.valid;
};

export const resetDemoPassword = async (token, password) => {
  await axiosInstance.post("/auth/password-reset", { token, password });
};
