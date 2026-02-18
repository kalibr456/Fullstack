import React, { useEffect, useState } from "react";
import { apiFetch } from "./api"; // Проверьте правильность пути к api.ts

interface Section {
  id: number;
  name: string;
  description?: string;
}

const Sections: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  // Получаем роль текущего пользователя
  const role = localStorage.getItem("role");

  // Состояние для формы добавления (только для админа)
  const [newSection, setNewSection] = useState({ name: "", description: "" });

  // 1. GET: Загружаем список всех секций
  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = () => {
    apiFetch("/sections/")
      .then((res) => res.json())
      .then((data) => setSections(data.sections || []))
      .catch((err) => console.error(err));
  };

  // 2. POST: Добавить секцию (Только Админ)
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await apiFetch("/sections/", {
        method: "POST",
        body: JSON.stringify(newSection),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Секция '${data.name}' успешно создана!`);
        setNewSection({ name: "", description: "" }); // Очистить форму
        loadSections(); // Обновить список
      } else {
        setMessage(`❌ Ошибка: ${data.error || "Не удалось создать секцию"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Ошибка сети");
    }
  };

  // 3. DELETE: Удалить секцию (Только Админ)
  const handleDeleteSection = async (id: number, name: string) => {
    if (!window.confirm(`Вы уверены, что хотите удалить секцию "${name}"?`))
      return;
    setMessage(null);

    try {
      const res = await apiFetch(`/sections/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Секция удалена`);
        // Удаляем из локального стейта, чтобы не перезагружать всё
        setSections(sections.filter((s) => s.id !== id));
      } else {
        setMessage(`❌ Ошибка: ${data.error || "Не удалось удалить"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Ошибка сети");
    }
  };

  // 4. POST: Записаться в секцию (Обычный пользователь)
  const handleJoin = async (sec: Section) => {
    setMessage(null);
    try {
      const response = await apiFetch("/sections/join", {
        method: "POST",
        body: JSON.stringify({ section_id: sec.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Вы успешно записались в секцию: ${sec.name}`);
      } else {
        setMessage(`❌ Ошибка: ${data.error || "Не удалось записаться"}`);
      }
    } catch (err) {
      console.error("Ошибка сети:", err);
      setMessage("❌ Произошла ошибка сети");
    }
  };

  return (
    <div style={{ padding: "2rem", minHeight: "100vh", background: "#f8fafc" }}>
      <h1 style={{ marginBottom: "1.5rem", color: "#1f2937" }}>
        Доступные секции
      </h1>

      {/* Блок сообщений */}
      {message && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1.5rem",
            backgroundColor: message.startsWith("✅") ? "#dcfce7" : "#fee2e2",
            color: message.startsWith("✅") ? "#166534" : "#991b1b",
            borderRadius: "8px",
            border: message.startsWith("✅")
              ? "1px solid #86efac"
              : "1px solid #fca5a5",
          }}
        >
          {message}
        </div>
      )}

      {/* --- ПАНЕЛЬ АДМИНИСТРАТОРА --- */}
      {role === "admin" && (
        <div
          style={{
            marginBottom: "2rem",
            padding: "1.5rem",
            backgroundColor: "#eff6ff",
            border: "2px dashed #3b82f6",
            borderRadius: "12px",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#1e40af" }}>
            🛠 Админ-панель: Добавить секцию
          </h3>
          <form
            onSubmit={handleAddSection}
            style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
          >
            <input
              type="text"
              placeholder="Название (например: Йога)"
              value={newSection.name}
              onChange={(e) =>
                setNewSection({ ...newSection, name: e.target.value })
              }
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                flex: 1,
              }}
              required
            />
            <input
              type="text"
              placeholder="Описание"
              value={newSection.description}
              onChange={(e) =>
                setNewSection({ ...newSection, description: e.target.value })
              }
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                flex: 2,
              }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Добавить
            </button>
          </form>
        </div>
      )}

      {/* --- СПИСОК СЕКЦИЙ --- */}
      {sections.length === 0 && (
        <p style={{ color: "#6b7280" }}>Загрузка списка секций...</p>
      )}

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
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: "0 0 0.5rem 0", color: "#111827" }}>
                {sec.name}
              </h3>
              {sec.description && (
                <p style={{ margin: 0, color: "#6b7280" }}>{sec.description}</p>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              {/* Кнопка ЗАПИСАТЬСЯ (видна всем, кроме, возможно, админа, если хотите) */}
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

              {/* Кнопка УДАЛИТЬ (Только Админ) */}
              {role === "admin" && (
                <button
                  onClick={() => handleDeleteSection(sec.id, sec.name)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
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

export default Sections;
