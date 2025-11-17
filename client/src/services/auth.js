import { api } from "./api";

export const loginUser = async (email, password) => {
  try {
    const res = await api.post("/auth/login", {
      email,
      password,
    });
    return res.data;
  } catch (error) {
    return { message: error.response?.data?.message };
  }
};


export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token; 
};

