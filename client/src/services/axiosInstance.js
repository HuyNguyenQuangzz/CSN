import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Interceptor để check token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await axios.post("http://localhost:5000/api/auth/refresh", {
          refreshToken,
        });

        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        // Gắn lại token vào request cũ
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        console.log("Refresh token failed, please login again.", err);
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
