import React, { useEffect, useState } from "react";

interface AIResponse {
  status: string;
  message: string;
  suggested_intensity: number;
}

const AIAdvisor: React.FC = () => {
  const [advice, setAdvice] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://127.0.0.1:5000/ai/recommend", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setAdvice(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("AI Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return null; // Не показываем ничего пока грузится
  if (!advice) return null;

  // Выбираем цвет в зависимости от совета
  const getColors = () => {
    switch (advice.status) {
      case "rest":
        return { bg: "#fef2f2", border: "#fca5a5", icon: "🛌" }; // Красный (отдых)
      case "recovery":
        return { bg: "#fff7ed", border: "#fdba74", icon: "🔋" }; // Оранжевый
      case "progress":
        return { bg: "#f0fdf4", border: "#86efac", icon: "🚀" }; // Зеленый
      default:
        return { bg: "#eff6ff", border: "#93c5fd", icon: "💡" }; // Синий (стандарт)
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
      }}
    >
      <div style={{ fontSize: "2rem" }}>{style.icon}</div>
      <div>
        <h3 style={{ margin: "0 0 0.5rem 0", color: "#1f2937" }}>
          Рекомендация тренера
        </h3>
        <p
          style={{
            margin: "0 0 0.5rem 0",
            color: "#4b5563",
            lineHeight: "1.5",
          }}
        >
          {advice.message}
        </p>
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
          Рекомендуемая интенсивность: {advice.suggested_intensity}/10
        </span>
      </div>
    </div>
  );
};

export default AIAdvisor;
