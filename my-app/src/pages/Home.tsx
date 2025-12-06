import React from "react";
import { Link } from "react-router-dom";
import AIAdvisor from "./AIAdvisor";
import { apiFetch } from "./api";

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

const Home: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        flexDirection: "column", // Важно: располагаем элементы сверху вниз
        alignItems: "center", // Центрируем по горизонтали
        justifyContent: "center", // Центрируем по вертикали (если контента мало)
        background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "800px", width: "100%" }}>
        {/* 1. Блок заголовка */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: 800,
              color: "#1f2937",
              marginBottom: "1rem",
              letterSpacing: "-0.05em",
            }}
          >
            Спортцентр
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "#6b7280",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            Твой личный помощник в мире спорта. Выбирай секции, следи за
            прогрессом и достигай новых высот.
          </p>
        </div>

        {/* 2. Блок ИИ Советника (Вставлен сюда!) */}
        <div style={{ marginBottom: "2rem" }}>
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
            desc="Записывайся на бокс, плавание и другие активности."
          />

          <MenuCard
            to="/diary"
            title="Дневник"
            icon="📅"
            color="#dcfce7"
            desc="Веди учет своих тренировок и следи за нагрузкой."
          />

          <MenuCard
            to="/users"
            title="Участники"
            icon="👥"
            color="#ffedd5"
            desc="Смотри, кто еще занимается спортом вместе с тобой."
          />
        </div>

        {/* 4. Футер ссылка */}
        <div style={{ marginTop: "3rem", textAlign: "center" }}>
          <Link
            to="/about"
            style={{
              color: "#6b7280",
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            Узнать больше о проекте &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
