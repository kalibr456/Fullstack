import React, { useState, useEffect } from "react";
import { apiFetch } from "./api"; // Проверь путь к api

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
  const [viewDate, setViewDate] = useState(new Date()); // Какой месяц смотрим
  const [selectedDate, setSelectedDate] = useState(new Date()); // Какой день выбран

  // Состояние формы
  const [form, setForm] = useState({
    section_id: "",
    duration: 30,
    intensity: 5,
    note: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  // --- ЗАГРУЗКА ДАННЫХ ---
  useEffect(() => {
    // 1. Секции
    apiFetch("/sections/")
      .then((res) => res.json())
      .then((data) => setSections(data.sections || []))
      .catch((err) => console.error(err));

    // 2. Тренировки
    apiFetch("/training/")
      .then((res) => res.json())
      .then((data) => setTrainings(data.trainings || []))
      .catch((err) => console.error(err));
  }, []);

  // --- ЛОГИКА КАЛЕНДАРЯ ---
  
  // Получить дни в месяце
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Получить день недели первого дня месяца (0-6, где 0 - Пн для нас)
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    // JS возвращает 0 для Воскресенья. Превратим в: 0-Пн ... 6-Вс
    return day === 0 ? 6 : day - 1;
  };

  // Переключение месяцев
  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.setMonth(viewDate.getMonth() + offset));
    setViewDate(new Date(newDate));
  };

  // Проверка: есть ли тренировка в этот день?
  const hasTraining = (day: number) => {
    const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return trainings.some(t => new Date(t.date).toDateString() === checkDate.toDateString());
  };

  // Фильтрация списка для выбранной даты
  const selectedDayTrainings = trainings.filter(t => 
    new Date(t.date).toDateString() === selectedDate.toDateString()
  );

  // --- ОТПРАВКА ФОРМЫ ---
  const addTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.section_id) return setMessage("⚠️ Выберите секцию");

    try {
      const res = await apiFetch("/training/", {
        method: "POST",
        body: JSON.stringify({
          section_id: parseInt(form.section_id),
          duration: form.duration,
          intensity: form.intensity,
          note: form.note,
          // Можно добавить дату, если бэкенд поддерживает добавление задним числом
          // date: selectedDate.toISOString() 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTrainings([data.training, ...trainings]); // Обновляем список
        setForm({ ...form, note: "" }); // Чистим форму
        setMessage("✅ Добавлено!");
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage(`❌ Ошибка: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- РЕНДЕР ---
  
  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDayOffset = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

  return (
    <div style={{ 
      padding: "2rem", 
      minHeight: "100vh", 
      background: "#f3f4f6", 
      fontFamily: "'Inter', sans-serif" 
    }}>
      
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
        
        {/* ЛЕВАЯ КОЛОНКА: КАЛЕНДАРЬ */}
        <div style={{ background: "white", borderRadius: "24px", padding: "2rem", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}>
          
          {/* Шапка календаря */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <button onClick={() => changeMonth(-1)} style={navBtnStyle}>&lt;</button>
            <h2 style={{ margin: 0, color: "#1f2937" }}>
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </h2>
            <button onClick={() => changeMonth(1)} style={navBtnStyle}>&gt;</button>
          </div>

          {/* Сетка дней недели */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "1rem", textAlign: "center", fontWeight: "bold", color: "#9ca3af" }}>
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(d => <div key={d}>{d}</div>)}
          </div>

          {/* Сетка дат */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px" }}>
            {/* Пустые ячейки для сдвига */}
            {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`empty-${i}`} />)}
            
            {/* Дни */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = 
                selectedDate.getDate() === day && 
                selectedDate.getMonth() === viewDate.getMonth() &&
                selectedDate.getFullYear() === viewDate.getFullYear();
              
              const isToday = 
                new Date().getDate() === day && 
                new Date().getMonth() === viewDate.getMonth();

              const hasWorkout = hasTraining(day);

              return (
                <div 
                  key={day}
                  onClick={() => setSelectedDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day))}
                  style={{
                    height: "50px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "12px",
                    cursor: "pointer",
                    position: "relative",
                    background: isSelected ? "#2563eb" : (isToday ? "#eff6ff" : "transparent"),
                    color: isSelected ? "white" : "#374151",
                    fontWeight: isSelected || isToday ? "bold" : "normal",
                    transition: "all 0.2s"
                  }}
                >
                  {day}
                  {/* Точка, если была тренировка */}
                  {hasWorkout && (
                    <div style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: isSelected ? "white" : "#f59e0b", // Желтая точка
                      marginTop: "4px"
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: СПИСОК И ФОРМА */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Список за выбранный день */}
          <div style={{ background: "white", borderRadius: "24px", padding: "1.5rem", boxShadow: "0 4px 10px rgba(0,0,0,0.05)", minHeight: "200px" }}>
            <h3 style={{ marginTop: 0, color: "#1f2937" }}>
              {selectedDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
            </h3>
            
            {selectedDayTrainings.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>В этот день тренировок не было.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {selectedDayTrainings.map(t => (
                  <div key={t.id} style={{ padding: "10px", background: "#f3f4f6", borderRadius: "12px" }}>
                    <div style={{ fontWeight: "bold", color: "#2563eb" }}>{t.section}</div>
                    <div style={{ fontSize: "0.85rem", color: "#4b5563" }}>⏱ {t.duration} мин | 🔥 {t.intensity}/10</div>
                    {t.note && <div style={{ fontSize: "0.8rem", fontStyle: "italic", marginTop: "4px" }}>"{t.note}"</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Форма добавления */}
          <div style={{ background: "#2563eb", borderRadius: "24px", padding: "1.5rem", color: "white", boxShadow: "0 10px 20px rgba(37, 99, 235, 0.3)" }}>
            <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Добавить запись</h3>
            <form onSubmit={addTraining} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              
              <select 
                value={form.section_id} 
                onChange={e => setForm({...form, section_id: e.target.value})}
                style={inputStyle}
                required
              >
                <option value="">Выберите секцию</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span>Время: {form.duration} мин</span>
                <span>Сила: {form.intensity}/10</span>
              </div>
              
              <input 
                type="range" min="10" max="180" step="5" 
                value={form.duration} onChange={e => setForm({...form, duration: Number(e.target.value)})}
              />
              <input 
                type="range" min="1" max="10" step="1" 
                value={form.intensity} onChange={e => setForm({...form, intensity: Number(e.target.value)})}
              />

              <input 
                type="text" 
                placeholder="Заметка..." 
                value={form.note} 
                onChange={e => setForm({...form, note: e.target.value})}
                style={inputStyle}
              />

              <button type="submit" style={{ ...inputStyle, background: "white", color: "#2563eb", fontWeight: "bold", cursor: "pointer", border: "none", marginTop: "10px" }}>
                Сохранить
              </button>

              {message && <div style={{ fontSize: "0.8rem", textAlign: "center", marginTop: "5px" }}>{message}</div>}
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- СТИЛИ ---
const navBtnStyle = {
  background: "#f3f4f6",
  border: "none",
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  cursor: "pointer",
  fontWeight: "bold" as const,
  color: "#374151"
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  fontSize: "0.9rem",
  outline: "none"
};

export default Diary;