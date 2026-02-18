import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Обновляем интерфейс: onLogin теперь ждет и токен, и роль
interface LoginProps {
  onLogin: (token: string, role: string) => void;
}

function Login({ onLogin }: LoginProps) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); // Очистка сообщений перед новым запросом

    try {
      const res = await fetch("http://127.0.0.1:5000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // 1. Получаем роль из ответа сервера (или ставим 'user' по умолчанию)
        const userRole = data.role || "user";

        // 2. Сохраняем в localStorage, чтобы данные остались после перезагрузки
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", userRole);

        // 3. Передаем данные "наверх" в App.tsx
        onLogin(data.token, userRole);

        setMessage("✅ Вход выполнен!");

        // Небольшая задержка перед редиректом для UX (опционально)
        setTimeout(() => {
          navigate("/");
        }, 500);
      } else {
        setMessage(`❌ ${data.error || "Ошибка авторизации"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Ошибка соединения с сервером");
    }
  };

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f0f2f5",
      fontFamily: "'Arial', sans-serif",
    },
    card: {
      backgroundColor: "#ffffff",
      padding: "40px",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      width: "100%",
      maxWidth: "400px",
      textAlign: "center" as const,
    },
    title: {
      fontSize: "2rem",
      marginBottom: "20px",
      fontWeight: "bold" as const,
      color: "#333",
    },
    input: {
      width: "100%",
      padding: "12px",
      marginBottom: "15px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      fontSize: "1rem",
      boxSizing: "border-box" as const, // Важно для padding
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      fontSize: "1rem",
      fontWeight: "bold" as const,
      cursor: "pointer",
      transition: "background 0.3s",
    },
    message: {
      marginTop: "15px",
      fontWeight: "bold" as const,
    },
    link: {
      color: "#007bff",
      textDecoration: "none",
      fontWeight: "bold" as const,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Вход</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Имя пользователя"
            value={formData.username}
            onChange={handleChange}
            style={styles.input}
            required // Добавлена валидация HTML5
          />
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            required // Добавлена валидация HTML5
          />
          <button type="submit" style={styles.button}>
            Войти
          </button>
        </form>

        {message && (
          <p
            style={{
              ...styles.message,
              color: message.startsWith("❌") ? "#e74c3c" : "#27ae60",
            }}
          >
            {message}
          </p>
        )}

        <p style={{ marginTop: "20px", fontSize: "0.9rem", color: "#555" }}>
          Нет аккаунта?{" "}
          <Link to="/register" style={styles.link}>
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
