import React, { useState, useEffect } from "react";
import api from "../api"; // Импортируем настроенный axios из Lab 2

// --- ТИПЫ ---
interface Section {
  id: number;
  name: string;
}

interface TrainingData {
  id: number;
  section: string;
  date: string;
  duration: number;
  intensity: number;
  note: string;
}

const Diary: React.FC = () => {
  // Данные
  const [trainings, setTrainings] = useState<TrainingData[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  // Состояние календаря
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Состояние формы
  const [form, setForm] = useState({
    section_id: "",
    duration: 30,
    intensity: 5,
    note: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  // --- ЗАГРУЗКА ДАННЫХ (Используем паттерн Lab 2 с axios) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        // Загружаем секции и тренировки параллельно
        const [sectionsRes, trainingsRes] = await Promise.all([
          api.get("/sections/"),
          api.get("/training/"),
        ]);

        setSections(sectionsRes.data.sections || []);
        setTrainings(trainingsRes.data.trainings || []);
      } catch (err) {
        console.error("Ошибка загрузки данных дневника:", err);
      }
    };

    loadData();
  }, []);

  // --- ЛОГИКА КАЛЕНДАРЯ ---

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + offset,
      1,
    );
    setViewDate(newDate);
  };

  const hasTraining = (day: number) => {
    const checkDate = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth(),
      day,
    );
    return trainings.some(
      (t) => new Date(t.date).toDateString() === checkDate.toDateString(),
    );
  };

  const selectedDayTrainings = trainings.filter(
    (t) => new Date(t.date).toDateString() === selectedDate.toDateString(),
  );

  // --- ОТПРАВКА ФОРМЫ (Пункт 3.2 и 5.3 задания - работа через защищенный api) ---
  const addTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.section_id) return setMessage("⚠️ Выберите секцию");

    try {
      // Подготавливаем дату с учетом времени, чтобы тренировка упала на нужный день
      const trainingDate = new Date(selectedDate);
      trainingDate.setHours(12, 0, 0); // Ставим полдень, чтобы избежать смещения поясов

      const res = await api.post("/training/", {
        section_id: parseInt(form.section_id),
        duration: form.duration,
        intensity: form.intensity,
        note: form.note,
        date: trainingDate.toISOString(), // Передаем дату выбранную в календаре
      });

      if (res.status === 201 || res.status === 200) {
        // Добавляем тренировку в начало списка
        setTrainings([res.data.training, ...trainings]);
        setForm({ ...form, note: "" });
        setMessage("✅ Запись сохранена!");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Ошибка сохранения";
      setMessage(`❌ ${errorMsg}`);
    }
  };

  // --- РЕНДЕР ---
  const daysInMonth = getDaysInMonth(
    viewDate.getFullYear(),
    viewDate.getMonth(),
  );
  const firstDayOffset = getFirstDayOfMonth(
    viewDate.getFullYear(),
    viewDate.getMonth(),
  );
  const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  return (
    <div
      style={{
        padding: "2rem",
        minHeight: "100vh",
        background: "#f3f4f6",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "2rem",
        }}
      >
        {/* ЛЕВАЯ КОЛОНКА: КАЛЕНДАРЬ */}
        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "2rem",
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
            }}
          >
            <button onClick={() => changeMonth(-1)} style={navBtnStyle}>
              &lt;
            </button>
            <h2 style={{ margin: 0, color: "#1f2937", fontSize: "1.4rem" }}>
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </h2>
            <button onClick={() => changeMonth(1)} style={navBtnStyle}>
              &gt;
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              marginBottom: "1rem",
              textAlign: "center",
              fontWeight: "bold",
              color: "#9ca3af",
            }}
          >
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "8px",
            }}
          >
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === viewDate.getMonth() &&
                selectedDate.getFullYear() === viewDate.getFullYear();

              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === new Date().getMonth() &&
                new Date().getFullYear() === new Date().getFullYear();

              const hasWorkout = hasTraining(day);

              return (
                <div
                  key={day}
                  onClick={() =>
                    setSelectedDate(
                      new Date(
                        viewDate.getFullYear(),
                        viewDate.getMonth(),
                        day,
                      ),
                    )
                  }
                  style={{
                    height: "55px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "12px",
                    cursor: "pointer",
                    background: isSelected
                      ? "#2563eb"
                      : isToday
                        ? "#eff6ff"
                        : "transparent",
                    color: isSelected
                      ? "white"
                      : isToday
                        ? "#2563eb"
                        : "#374151",
                    fontWeight: isSelected || isToday ? "bold" : "normal",
                    transition: "all 0.2s",
                    border:
                      isToday && !isSelected ? "1px solid #bfdbfe" : "none",
                  }}
                >
                  {day}
                  {hasWorkout && (
                    <div
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: isSelected ? "white" : "#f59e0b",
                        marginTop: "4px",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {/* Активности дня */}
          <div
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "1.5rem",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: "#1f2937",
                borderBottom: "1px solid #f3f4f6",
                paddingBottom: "10px",
              }}
            >
              {selectedDate.toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
              })}
            </h3>

            <div style={{ marginTop: "1rem" }}>
              {selectedDayTrainings.length === 0 ? (
                <p
                  style={{
                    color: "#9ca3af",
                    fontSize: "0.9rem",
                    textAlign: "center",
                  }}
                >
                  Событий не найдено.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.8rem",
                  }}
                >
                  {selectedDayTrainings.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        padding: "12px",
                        background: "#f8fafc",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ fontWeight: "bold", color: "#1e40af" }}>
                        {t.section}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        ⏱ {t.duration} м | Нагрузка: {t.intensity}
                      </div>
                      {t.note && (
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#475569",
                            marginTop: "4px",
                            borderTop: "1px solid #edf2f7",
                            paddingTop: "4px",
                          }}
                        >
                          {t.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Форма добавления (Адаптирована под синий стиль) */}
          <div
            style={{
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              borderRadius: "24px",
              padding: "1.5rem",
              color: "white",
            }}
          >
            <h3
              style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.1rem" }}
            >
              Добавить запись
            </h3>
            <form
              onSubmit={addTraining}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <select
                value={form.section_id}
                onChange={(e) =>
                  setForm({ ...form, section_id: e.target.value })
                }
                style={inputStyle}
              >
                <option value="">Выберите секцию</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <div
                style={{
                  fontSize: "0.8rem",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Время: {form.duration} мин</span>
                <span>Интенс: {form.intensity}/10</span>
              </div>

              <input
                type="range"
                min="10"
                max="180"
                step="5"
                value={form.duration}
                onChange={(e) =>
                  setForm({ ...form, duration: Number(e.target.value) })
                }
              />

              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={form.intensity}
                onChange={(e) =>
                  setForm({ ...form, intensity: Number(e.target.value) })
                }
              />

              <input
                type="text"
                placeholder="Комментарий..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                style={inputStyle}
              />

              <button type="submit" style={btnStyle}>
                Сохранить
              </button>
              {message && (
                <div
                  style={{
                    fontSize: "0.8rem",
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Стили
const navBtnStyle = {
  background: "white",
  border: "1px solid #e5e7eb",
  width: "32px",
  height: "32px",
  borderRadius: "8px",
  cursor: "pointer",
  color: "#374151",
};
const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "10px",
  border: "none",
  fontSize: "0.9rem",
  color: "#1f2937",
  outline: "none",
};
const btnStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "white",
  color: "#2563eb",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "10px",
};

export default Diary;
