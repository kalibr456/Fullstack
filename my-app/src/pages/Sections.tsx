import React, { useEffect, useState } from "react";

interface Section {
  id: number;
  name: string;
  description?: string; // Добавил описание, так как оно есть в БД
}

const Sections: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  // 1. GET: Загружаем список всех секций
  useEffect(() => {
    fetch("http://127.0.0.1:5000/sections/")
      .then((res) => res.json())
      .then((data) => {
        // Проверяем структуру ответа (data.sections)
        setSections(data.sections || []);
      })
      .catch((err) => console.error("Ошибка при загрузке секций:", err));
  }, []);

  // 2. POST: Записаться в секцию
  const handleJoin = async (sec: Section) => {
    setMessage(null);

    // (!) Достаем токен. Предполагаем, что при логине вы сделали:
    // localStorage.setItem('token', tokenFromServer);
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Вы не авторизованы! Пожалуйста, войдите в систему.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/sections/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // (!) Самое важное: отправляем токен
          Authorization: `Bearer ${token}`,
        },
        // (!) Отправляем ID секции, как ждет бэкенд
        body: JSON.stringify({ section_id: sec.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Вы успешно записались в секцию: ${sec.name}`);
        // Можно тут обновить состояние, чтобы кнопку сделать неактивной
      } else {
        // Если ошибка (например, "Вы уже записаны")
        setMessage(`❌ Ошибка: ${data.error || "Не удалось записаться"}`);
      }
    } catch (err) {
      console.error("Ошибка сети:", err);
      setMessage("❌ Произошла ошибка сети");
    }
  };

  return (
    <div style={{ padding: "2rem", minHeight: "100vh", background: "#f8fafc" }}>
      <h1>Доступные секции</h1>

      {/* Сообщение об успехе или ошибке */}
      {message && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1rem",
            backgroundColor: message.startsWith("✅") ? "#dcfce7" : "#fee2e2",
            borderRadius: "8px",
          }}
        >
          {message}
        </div>
      )}

      {sections.length === 0 && <p>Загрузка списка секций...</p>}

      <div style={{ display: "grid", gap: "1rem" }}>
        {sections.map((sec) => (
          <div
            key={sec.id}
            style={{
              padding: "1.5rem",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 0.5rem 0" }}>{sec.name}</h3>
              {sec.description && (
                <p style={{ margin: 0, color: "#666" }}>{sec.description}</p>
              )}
            </div>

            <button
              onClick={() => handleJoin(sec)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Записаться
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sections;
