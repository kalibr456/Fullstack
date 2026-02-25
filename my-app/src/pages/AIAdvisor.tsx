import React, { useEffect, useState } from "react";
import api from "../api"; // Импортируем настроенный axios из Лабораторной №2

interface AIResponse {
  status: string;
  message: string;
  suggested_intensity: number;
}

const AIAdvisor: React.FC = () => {
  const [advice, setAdvice] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvice = async () => {
      try {
        // Используем api.get вместо apiFetch.
        // Interceptor в api.ts сам добавит заголовок Authorization и обновит токен при необходимости.
        const res = await api.get("/ai/recommend");

        // В Axios данные лежат сразу в поле data
        if (res.data) {
          setAdvice(res.data);
        }
      } catch (err) {
        console.error("AI Advisor Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvice();
  }, []);

  if (loading) return null;
  if (!advice) return null;

  // Логика выбора цветов в зависимости от статуса рекомендации
  const getColors = () => {
    switch (advice.status) {
      case "rest":
        return { bg: "#fef2f2", border: "#fca5a5", icon: "🛌" }; // Красный (Отдых)
      case "recovery":
        return { bg: "#fff7ed", border: "#fdba74", icon: "🔋" }; // Оранжевый (Восстановление)
      case "progress":
        return { bg: "#f0fdf4", border: "#86efac", icon: "🚀" }; // Зеленый (Прогресс)
      default:
        return { bg: "#eff6ff", border: "#93c5fd", icon: "💡" }; // Синий (Инфо)
    }
  };

  const style = getColors();

  return (
    <div
      style={{
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: "16px",
        padding: "1.5rem",
        marginBottom: "2rem",
        display: "flex",
        alignItems: "start",
        gap: "1rem",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ fontSize: "2.3rem" }}>{style.icon}</div>
      <div>
        <h3
          style={{
            margin: "0 0 0.5rem 0",
            color: "#1f2937",
            fontSize: "1.1rem",
          }}
        >
          Рекомендация ИИ-тренера
        </h3>
        <p
          style={{
            margin: "0 0 0.7rem 0",
            color: "#4b5563",
            lineHeight: "1.5",
            fontSize: "0.95rem",
          }}
        >
          {advice.message}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              backgroundColor: "white",
              borderRadius: "20px",
              fontSize: "0.85rem",
              fontWeight: "bold",
              color: "#374151",
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            Цель нагрузки: {advice.suggested_intensity}/10
          </span>
          <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
            на основе последних тренировок
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
