import { Link } from "react-router-dom";
import React from "react";

const Home: React.FC = () => {
  const handleHover = (e: React.MouseEvent<HTMLAnchorElement>, color: string, scale: string) => {
    e.currentTarget.style.backgroundColor = color;
    e.currentTarget.style.transform = scale;
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        margin: 0,
        background: "linear-gradient(135deg, #c2e9fb, #81a4fd)",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "3rem 4rem",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          textAlign: "center",
          maxWidth: "420px",
          width: "90%",
        }}
      >
        <h1 style={{ marginBottom: "1rem", color: "#1f2937" }}>🏋️‍♂️ Спортцентр</h1>
        <p style={{ color: "#4b5563", marginBottom: "2rem" }}>
          Добро пожаловать! Выберите нужный раздел:
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Существующие кнопки */}
          <Link
            to="/sections"
            style={{
              padding: "0.8rem",
              borderRadius: "10px",
              backgroundColor: "#2563eb",
              color: "white",
              textDecoration: "none",
              fontWeight: "500",
              transition: "transform 0.2s, background-color 0.3s",
            }}
            onMouseEnter={(e) => handleHover(e, "#1d4ed8", "scale(1.05)")}
            onMouseLeave={(e) => handleHover(e, "#2563eb", "scale(1)")}
          >
            🏆 Выбрать секцию
          </Link>

          <Link
            to="/diary"
            style={{
              padding: "0.8rem",
              borderRadius: "10px",
              backgroundColor: "#10b981",
              color: "white",
              textDecoration: "none",
              fontWeight: "500",
              transition: "transform 0.2s, background-color 0.3s",
            }}
            onMouseEnter={(e) => handleHover(e, "#059669", "scale(1.05)")}
            onMouseLeave={(e) => handleHover(e, "#10b981", "scale(1)")}
          >
            📓 Дневник тренировок
          </Link>

          {/* Новые кнопки */}
          <Link
            to="/about"
            style={{
              padding: "0.8rem",
              borderRadius: "10px",
              backgroundColor: "#f59e0b",
              color: "white",
              textDecoration: "none",
              fontWeight: "500",
              transition: "transform 0.2s, background-color 0.3s",
            }}
            onMouseEnter={(e) => handleHover(e, "#d97706", "scale(1.05)")}
            onMouseLeave={(e) => handleHover(e, "#f59e0b", "scale(1)")}
          >
            ℹ️ О нас
          </Link>

          <Link
            to="/register"
            style={{
              padding: "0.8rem",
              borderRadius: "10px",
              backgroundColor: "#8b5cf6",
              color: "white",
              textDecoration: "none",
              fontWeight: "500",
              transition: "transform 0.2s, background-color 0.3s",
            }}
            onMouseEnter={(e) => handleHover(e, "#7c3aed", "scale(1.05)")}
            onMouseLeave={(e) => handleHover(e, "#8b5cf6", "scale(1)")}
          >
            📝 Регистрация
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;


