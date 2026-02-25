import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api"; // Импортируем настроенный axios

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      // Используем api.post (Паттерн архитектурного разделения)
      const res = await api.post("/users/register", formData);

      if (res.status === 201 || res.status === 200) {
        setMessage("✅ Регистрация успешна! Перенаправление на вход...");
        // Очищаем форму
        setFormData({ username: "", email: "", password: "" });

        // Через 2 секунды отправляем на логин
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error: any) {
      // Обработка ошибок в стиле Axios
      const errorMsg =
        error.response?.data?.error || "Не удалось зарегистрироваться";
      setMessage(`❌ Ошибка: ${errorMsg}`);
    }
  };

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f3f4f6",
      fontFamily: "'Inter', sans-serif",
    },
    card: {
      backgroundColor: "#fff",
      padding: "40px",
      borderRadius: "16px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
      width: "100%",
      maxWidth: "400px",
      textAlign: "center" as const,
    },
    title: {
      fontSize: "2rem",
      marginBottom: "20px",
      fontWeight: 800,
      color: "#1f2937",
      letterSpacing: "-0.02em",
    },
    input: {
      width: "100%",
      padding: "12px",
      marginBottom: "15px",
      borderRadius: "10px",
      border: "1px solid #e5e7eb",
      fontSize: "1rem",
      outline: "none",
      boxSizing: "border-box" as const,
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#2563eb",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      fontSize: "1rem",
      fontWeight: "bold" as const,
      cursor: "pointer",
      transition: "background 0.2s",
    },
    message: {
      marginTop: "15px",
      fontSize: "0.9rem",
      fontWeight: 600,
    },
    link: {
      color: "#2563eb",
      textDecoration: "none",
      fontWeight: 600,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Создать аккаунт</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Имя пользователя"
            value={formData.username}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <button
            type="submit"
            style={styles.button}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#1d4ed8")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#2563eb")
            }
          >
            Зарегистрироваться
          </button>
        </form>

        {message && (
          <p
            style={{
              ...styles.message,
              color: message.startsWith("❌") ? "#ef4444" : "#10b981",
            }}
          >
            {message}
          </p>
        )}

        <div
          style={{ marginTop: "25px", fontSize: "0.9rem", color: "#6b7280" }}
        >
          Уже есть аккаунт?{" "}
          <Link to="/login" style={styles.link}>
            Войти
          </Link>
        </div>

        <p style={{ marginTop: "15px" }}>
          <Link
            to="/"
            style={{
              color: "#9ca3af",
              textDecoration: "none",
              fontSize: "0.85rem",
            }}
          >
            ← Назад на главную
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
