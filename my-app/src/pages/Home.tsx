import React from "react";
import { Link } from "react-router-dom";
import AIAdvisor from "./AIAdvisor"; // Убедитесь, что путь к AIAdvisor верный

// --- Вспомогательный компонент для карточки меню (без изменений) ---
const MenuCard = ({
  to,
  title,
  icon,
  desc,
  color,
}: {
  to: string;
  title: string;
  icon: string;
  desc: string;
  color: string;
}) => {
  return (
    <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)",
          transition: "transform 0.2s, box-shadow 0.2s",
          border: "1px solid rgba(0,0,0,0.05)",
          height: "100%",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow =
            "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            "0 10px 15px -3px rgba(0, 0, 0, 0.05)";
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.75rem",
            marginBottom: "1rem",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          }}
        >
          {icon}
        </div>

        <h3
          style={{
            margin: "0 0 0.5rem 0",
            color: "#111827",
            fontSize: "1.25rem",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: 0,
            color: "#6b7280",
            fontSize: "0.95rem",
            lineHeight: "1.5",
          }}
        >
          {desc}
        </p>
      </div>
    </Link>
  );
};

// --- Основной компонент страницы ---
const Home: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "800px", width: "100%" }}>
        {/* 1. Блок заголовка */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "3.2rem",
              fontWeight: 800,
              color: "#1f2937",
              marginBottom: "1rem",
              letterSpacing: "-0.05em",
            }}
          >
            SportCenter
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "#6b7280",
              maxWidth: "520px",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            Твой интеллектуальный помощник в тренировках. Управляй своим
            прогрессом и получай персональные рекомендации в реальном времени.
          </p>
        </div>

        {/* 2. Блок ИИ Советника */}
        {/* Теперь он работает через обновленный api.ts (Axios + Refresh Token) */}
        <div style={{ marginBottom: "2.5rem", width: "100%" }}>
          <AIAdvisor />
        </div>

        {/* 3. Сетка навигации */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <MenuCard
            to="/sections"
            title="Секции"
            icon="🥊"
            color="#dbeafe"
            desc="Просмотр и запись в доступные спортивные группы."
          />

          <MenuCard
            to="/diary"
            title="Дневник"
            icon="📅"
            color="#dcfce7"
            desc="Календарь тренировок: планирование и история нагрузок."
          />

          <MenuCard
            to="/users"
            title="Участники"
            icon="👥"
            color="#ffedd5"
            desc="Сообщество спортсменов и управление профилями."
          />
        </div>

        {/* 4. Ссылка "О проекте" */}
        <div style={{ marginTop: "3.5rem", textAlign: "center" }}>
          <Link
            to="/about"
            style={{
              color: "#9ca3af",
              textDecoration: "none",
              fontSize: "0.9rem",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#4b5563")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
          >
            Техническая информация о проекте &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
