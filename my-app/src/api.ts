import axios from "axios";

const API_URL = "http://127.0.0.1:5000";

const api = axios.create({
  baseURL: API_URL,
});

// Добавляем Access Token в каждый запрос
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Перехватчик ошибок (Auto-Refresh)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если сервер ответил 401 (токен протух)
    if (
      (error.response?.status === 401 || error.response?.status === 422) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          // Идем за новым access токеном, используя refresh токен
          const res = await axios.post(
            `${API_URL}/users/refresh`,
            {},
            {
              headers: { Authorization: `Bearer ${refreshToken}` },
            },
          );

          const newAccessToken = res.data.access_token;
          localStorage.setItem("access_token", newAccessToken);

          // Повторяем изначальный запрос с новым токеном
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Если даже Refresh токен не сработал - выходим
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
