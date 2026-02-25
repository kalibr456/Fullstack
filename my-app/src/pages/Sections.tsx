import React, { useEffect, useState } from "react";
// Импортируем наш новый настроенный axios
import api from "../api";

interface Section {
  id: number;
  name: string;
  description?: string;
}

const Sections: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const role = localStorage.getItem("role");
  const [newSection, setNewSection] = useState({ name: "", description: "" });

  useEffect(() => {
    loadSections();
  }, []);

  // 1. GET: Загрузка секций
  const loadSections = async () => {
    try {
      const res = await api.get("/sections/");
      // В axios данные лежат в res.data
      setSections(res.data.sections || []);
    } catch (err) {
      console.error("Ошибка при загрузке секций:", err);
    }
  };

  // 2. POST: Добавление новой секции (только для админа)
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      // Отправляем объект напрямую, JSON.stringify не нужен
      const res = await api.post("/sections/", newSection);

      setMessage(`✅ Секция '${res.data.name}' успешно создана!`);
      setNewSection({ name: "", description: "" });
      loadSections();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Не удалось создать секцию";
      setMessage(`❌ Ошибка: ${errorMsg}`);
    }
  };

  // 3. DELETE: Удаление секции (только для админа)
  const handleDeleteSection = async (id: number, name: string) => {
    if (!window.confirm(`Вы уверены, что хотите удалить секцию "${name}"?`))
      return;
    setMessage(null);

    try {
      await api.delete(`/sections/${id}`);
      setMessage(`✅ Секция удалена`);
      setSections(sections.filter((s) => s.id !== id));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Не удалось удалить";
      setMessage(`❌ Ошибка: ${errorMsg}`);
    }
  };

  // 4. POST: Записаться в секцию (для всех пользователей)
  const handleJoin = async (sec: Section) => {
    setMessage(null);
    try {
      const res = await api.post("/sections/join", { section_id: sec.id });
      setMessage(`✅ Вы успешно записались в секцию: ${sec.name}`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Не удалось записаться";
      setMessage(`❌ Ошибка: ${errorMsg}`);
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <h1 style={{ marginBottom: "1.5rem", color: "#1f2937", fontWeight: 800 }}>
        Доступные секции
      </h1>

      {/* Блок уведомлений */}
      {message && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1.5rem",
            backgroundColor: message.startsWith("✅") ? "#dcfce7" : "#fee2e2",
            color: message.startsWith("✅") ? "#166534" : "#991b1b",
            borderRadius: "12px",
            border: `1px solid ${message.startsWith("✅") ? "#86efac" : "#fca5a5"}`,
            fontWeight: 500,
          }}
        >
          {message}
        </div>
      )}

      {/* Админ-панель создания */}
      {role === "admin" && (
        <div
          style={{
            marginBottom: "2rem",
            padding: "1.5rem",
            backgroundColor: "#eff6ff",
            border: "2px dashed #3b82f6",
            borderRadius: "16px",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#1e40af", marginBottom: "1rem" }}>
            🛠 Админ-панель: Добавить секцию
          </h3>
          <form
            onSubmit={handleAddSection}
            style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
          >
            <input
              type="text"
              placeholder="Название (например: Бокс)"
              value={newSection.name}
              onChange={(e) =>
                setNewSection({ ...newSection, name: e.target.value })
              }
              style={inputStyle}
              required
            />
            <input
              type="text"
              placeholder="Описание"
              value={newSection.description}
              onChange={(e) =>
                setNewSection({ ...newSection, description: e.target.value })
              }
              style={{ ...inputStyle, flex: 2 }}
            />
            <button type="submit" style={adminBtnStyle}>
              Создать
            </button>
          </form>
        </div>
      )}

      {/* Список секций */}
      {sections.length === 0 && (
        <p style={{ color: "#6b7280", textAlign: "center" }}>
          Загрузка списка секций...
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {sections.map((sec) => (
          <div
            key={sec.id}
            style={{
              padding: "1.5rem",
              backgroundColor: "white",
              borderRadius: "16px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              border: "1px solid #f1f5f9",
            }}
          >
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ margin: "0 0 0.5rem 0", color: "#111827" }}>
                {sec.name}
              </h3>
              {sec.description && (
                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "0.9rem",
                    lineHeight: "1.5",
                  }}
                >
                  {sec.description}
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
              <button onClick={() => handleJoin(sec)} style={joinBtnStyle}>
                Записаться
              </button>

              {role === "admin" && (
                <button
                  onClick={() => handleDeleteSection(sec.id, sec.name)}
                  style={deleteBtnStyle}
                >
                  Удалить
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Стили ---
const inputStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  fontSize: "0.95rem",
  flex: 1,
  outline: "none",
};

const adminBtnStyle = {
  padding: "10px 20px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};

const joinBtnStyle = {
  flex: 1,
  padding: "10px",
  backgroundColor: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "0.9rem",
};

const deleteBtnStyle = {
  padding: "10px 15px",
  backgroundColor: "#fee2e2",
  color: "#ef4444",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "0.9rem",
};

export default Sections;
