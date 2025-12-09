import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (original.url.includes("/auth/refresh")) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401) {
      try {
        await api.post("/auth/refresh");

        return api(original);
      } catch {
        return Promise.reject(err);
      }
    }

    return Promise.reject(err);
  }
);
