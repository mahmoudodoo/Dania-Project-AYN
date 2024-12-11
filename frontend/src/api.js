import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access"); // Correct token key
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true; // Avoid infinite retry loops
      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken) {
        try {
          const response = await axios.post(`${api.defaults.baseURL}/api/token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem("access", response.data.access);
          error.config.headers.Authorization = `Bearer ${response.data.access}`;
          return axios(error.config); // Retry the original request
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
