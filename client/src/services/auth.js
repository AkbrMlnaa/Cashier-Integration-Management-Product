/* eslint-disable no-unused-vars */
import { api } from "./api";


export const loginUser = async (email, password) => {
  try {
    await api.post("/auth/login", { email, password });

    // setelah login cukup panggil profile
    const res = await api.get("/v1/profile");

    return { error: false, profile: res.data };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Login gagal",
    };
  }
};



export const getProfile = async () => {
  try {
    const res = await api.get("/v1/profile");
    return res.data;
  } catch (err) {
    return { error: err.response?.data?.error || "Gagal mengambil profile" };
  }
};

