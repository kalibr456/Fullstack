import React, { useState, useEffect } from "react";

// Тип для Секции (для выпадающего списка)
interface Section {
  id: number;
  name: string;
}

// Тип для Тренировки (то, что приходит с бэкенда)
interface TrainingData {
  id: number;
  section: string; // Имя секции (бэкенд возвращает имя в to_dict)
  date: string;
  duration: number;
  intensity: number;
  note: string;
}

const Training: React.FC = () => {
  const [trainings, setTrainings] = useState<TrainingData[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  // Состояние формы
  const [form, setForm] = useState({
    section_id: "", // Отправляем ID, а не имя
    duration: 30,
    intensity: 5,
    note: "",
  });

  const [message, setMessage] = useState<string | null>(null);

  // 1. Загрузка данных при старте
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ Вы не авторизованы. Пожалуйста, войдите в систему.");
      return;
    }

    // Загружаем список секций для выпадающего списка
    fetch("http://127.0.0.1:5000/sections/")
      .then((res) => res.json())
      .then((data) => setSections(data.sections || []))
      .catch((err) => console.error("Ошибка загрузки секций:", err));

    // Загружаем тренировки пользователя
    fetch("http://127.0.0.1:5000/training/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setTrainings(data.trainings || []))
      .catch((err) => console.error("Ошибка загрузки тренировок:", err));
  }, []);

  // 2. Отправка формы
  const addTraining = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const token = localStorage.getItem("token");
    if (!token) return;

    if (!form.section_id) {
      setMessage("⚠️ Пожалуйста, выберите секцию");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/training/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // (!) Важно
        },
        body: JSON.stringify({
          section_id: parseInt(form.section_id),
          duration: form.duration,
          intensity: form.intensity,
          note: form.note,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Добавляем новую тренировку в список (data.training приходит с бэка)
        setTrainings([data.training, ...trainings]);
        // Сбрасываем форму (кроме секции, для удобства)
        setForm({ ...form, duration: 30, intensity: 5, note: "" });
        setMessage("✅ Тренировка успешно добавлена!");

        // Убираем сообщение через 3 секунды
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage(`❌ Ошибка: ${data.error || "Не удалось сохранить"}`);
      }
    } catch (err) {
      console.error("Ошибка сети:", err);
      setMessage("❌ Ошибка соединения с сервером");
    }
  };

  // Хелпер для красивой даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        padding: "2rem",
        minHeight: "100vh",
        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(135deg, #e0f7fa, #fff)",
      }}
    >
      <h1
        style={{ textAlign: "center", color: "#1f2937", marginBottom: "2rem" }}
      >
        🏋️‍♂️ Мои Тренировки
      </h1>

      {/* Форма добавления */}
      <form
        onSubmit={addTraining}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "400px",
          margin: "0 auto 2rem",
          padding: "1.5rem",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
        }}
      >
        {/* Сообщение об статусе */}
        {message && (
          <div
            style={{
              padding: "0.5rem",
              borderRadius: "6px",
              textAlign: "center",
              background: message.startsWith("❌")
                ? "#fee2e2"
                : message.startsWith("⚠️")
                ? "#fef3c7"
                : "#dcfce7",
              color: "#333",
            }}
          >
            {message}
          </div>
        )}

        {/* Выбор секции */}
        <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Секция</label>
        <select
          value={form.section_id}
          onChange={(e) => setForm({ ...form, section_id: e.target.value })}
          style={{
            padding: "0.6rem",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: "white",
          }}
          required
        >
          <option value="" disabled>
            Выберите секцию...
          </option>
          {sections.map((sec) => (
            <option key={sec.id} value={sec.id}>
              {sec.name}
            </option>
          ))}
        </select>

        {/* Длительность */}
        <label>
          Длительность: <strong>{form.duration} мин</strong>
          <input
            type="range"
            min={10}
            max={180}
            step={5}
            value={form.duration}
            onChange={(e) =>
              setForm({ ...form, duration: Number(e.target.value) })
            }
            style={{ width: "100%", marginTop: "0.5rem" }}
          />
        </label>

        {/* Интенсивность */}
        <label>
          Нагрузка: <strong>{form.intensity}/10</strong>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={form.intensity}
            onChange={(e) =>
              setForm({ ...form, intensity: Number(e.target.value) })
            }
            style={{ width: "100%", marginTop: "0.5rem" }}
          />
        </label>

        {/* Заметка */}
        <input
          type="text"
          placeholder="Заметка (например: Болело колено)"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          style={{
            padding: "0.6rem",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
          }}
        />

        <button
          type="submit"
          style={{
            marginTop: "10px",
            padding: "0.7rem",
            borderRadius: "8px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.3s",
          }}
        >
          Записать тренировку
        </button>
      </form>

      {/* Список тренировок */}
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {trainings.length === 0 && (
          <p style={{ textAlign: "center", color: "#6b7280" }}>
            У вас пока нет записанных тренировок.
          </p>
        )}

        {trainings.map((t) => (
          <div
            key={t.id}
            style={{
              background: "white",
              padding: "1rem 1.5rem",
              marginBottom: "1rem",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0, color: "#1e40af" }}>{t.section}</h3>
              <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                {formatDate(t.date)}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                color: "#4b5563",
                fontSize: "0.95rem",
              }}
            >
              <span>⏱ {t.duration} мин</span>
              <span>🔥 {t.intensity}/10</span>
            </div>

            {t.note && (
              <div
                style={{
                  marginTop: "0.5rem",
                  padding: "0.5rem",
                  background: "#f3f4f6",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  fontStyle: "italic",
                }}
              >
                "{t.note}"
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Training;
