import { api } from "./api";

export const loginUser = async (email, password) => {
  try {
    const res = await api.post(
      "/auth/login",
      { email, password },
    );

    return { error: false, ...res.data };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Login gagal",
    };
  }
};



export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

export const getProfile = async () => {
  try {
    const res = await api.get("/v1/profile");
    return res.data;
  } catch (err) {
    return { error: err.response?.data?.error || "Gagal mengambil profile" };
  }
};

export const refreshToken = async () => {
  try {
    await api.post("/refresh");
  } catch (err) {
    console.log("Refresh token gagal:", err);
  }
};