// (!) Указываем адрес вашего бэкенда
const BASE_URL = "http://127.0.0.1:5000";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  // 1. Получаем токен (проверьте, как он у вас называется: 'token' или 'accessToken')
  // Если вы используете простую схему, скорее всего это 'token'
  const token = localStorage.getItem("token");

  // 2. Формируем заголовки
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // 3. Формируем полный URL
  // Если endpoint начинается с http, оставляем как есть, иначе добавляем BASE_URL
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, { ...options, headers });

    // 4. Проверка на протухший токен (401 Unauthorized)
    if (response.status === 401) {
      console.warn("Токен истек или неверен. Выход из системы...");
      localStorage.removeItem("token");
      // Перенаправляем на логин
      window.location.href = "/login";
      return response;
    }

    return response;
  } catch (error) {
    console.error("Ошибка сети:", error);
    throw error;
  }
};
