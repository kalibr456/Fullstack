import React from "react";
import { Link } from "react-router-dom";
import AIAdvisor from "./AIAdvisor"; 
import SEO from "../components/SEO"; // Новый компонент для мета-тегов
import WeatherWidget from "../components/WeatherWidget"; // Новый компонент для API погоды

// --- Вспомогательный компонент для карточки меню ---
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
      <section
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
      </section>
    </Link>
  );
};

// --- Основной компонент страницы ---
const Home: React.FC = () => {
  return (
    <main
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
      {/* 1. SEO Оптимизация (Пункт 2.3) */}
      <SEO 
        title="Главная" 
        description="SportCenter — ваш интеллектуальный помощник для тренировок. Следите за прогрессом и получайте рекомендации от ИИ." 
      />

      <div style={{ maxWidth: "800px", width: "100%" }}>
        
        {/* 2. Блок заголовка и Погоды (Пункт 6.1) */}
        <header style={{ textAlign: "center", marginBottom: "2rem" }}>
          
          {/* Сторонний API: Виджет погоды */}
          <WeatherWidget />

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
            Персональный ассистент для ваших спортивных достижений. 
            Анализируйте нагрузки и достигайте целей быстрее.
          </p>
        </header>

        {/* 3. Блок ИИ Советника */}
        <section style={{ marginBottom: "2.5rem", width: "100%" }}>
          <AIAdvisor />
        </section>

        {/* 4. Сетка навигации (Семантические блоки section) */}
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
            desc="Записывайтесь в спортивные группы и секции."
          />

          <MenuCard
            to="/diary"
            title="Дневник"
            icon="📅"
            color="#dcfce7"
            desc="Ведите учет тренировок и следите за историей."
          />

          <MenuCard
            to="/users"
            title="Участники"
            icon="👥"
            color="#ffedd5"
            desc="Смотрите профили других спортсменов сообщества."
          />
        </div>

        {/* 5. Подвал страницы */}
        <footer style={{ marginTop: "3.5rem", textAlign: "center" }}>
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
            Подробнее о платформе SportCenter &rarr;
          </Link>
        </footer>
      </div>
    </main>
  );
};

export default Home;