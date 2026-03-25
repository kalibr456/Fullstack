import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api"; 

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
  file_url?: string; 
}

const Diary: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trainings, setTrainings] = useState<TrainingData[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const searchQuery = searchParams.get("search") || "";
  const filterSection = searchParams.get("section_id") || "";
  const sortQuery = searchParams.get("sort") || "date_desc";

  const [viewDate, setViewDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [form, setForm] = useState({ section_id: "", duration: 30, intensity: 5, note: "" });
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const formatDateKey = (d: Date | string) => {
    const date = new Date(d);
    return date.toLocaleDateString('sv-SE'); 
  };

  // --- ЗАГРУЗКА ---
  const loadTrainings = useCallback(async (currentParams: URLSearchParams, dateToFilter: Date) => {
    try {
      const queryParams = new URLSearchParams(currentParams);
      queryParams.set("date", formatDateKey(dateToFilter));
      const res = await api.get(`/training/?${queryParams.toString()}`);
      setTrainings(res.data.trainings || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error("Ошибка загрузки:", err);
    }
  }, []);

  useEffect(() => {
    api.get("/sections/").then(res => setSections(res.data.sections || []));
  }, []);

  useEffect(() => {
    loadTrainings(searchParams, selectedDate);
  }, [searchParams, selectedDate, loadTrainings]);

  const updateFilters = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    if (key !== "page") newParams.set("page", "1");
    setSearchParams(newParams);
  };

  // --- ДОБАВЛЕНИЕ ---
  const addTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.section_id) return setMessage("⚠️ Выберите секцию");
    setIsUploading(true);
    const formData = new FormData();
    formData.append("section_id", form.section_id);
    formData.append("duration", String(form.duration));
    formData.append("intensity", String(form.intensity));
    formData.append("note", form.note);
    formData.append("date", formatDateKey(selectedDate)); 
    if (file) formData.append("file", file);

    try {
      const res = await api.post("/training/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.status === 201) {
        setMessage("✅ Сохранено!");
        setForm({ ...form, note: "" });
        setFile(null);
        const freshParams = new URLSearchParams(searchParams);
        freshParams.set("page", "1");
        setSearchParams(freshParams);
        await loadTrainings(freshParams, selectedDate);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err: any) {
      setMessage(`❌ Ошибка: ${err.response?.data?.error || "Ошибка"}`);
    } finally {
      setIsUploading(false);
    }
  };

  // --- НОВОЕ: УДАЛЕНИЕ (Пункт 4.1 и 5.3 задания) ---
  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить эту запись и связанный файл?")) return;

    try {
      const res = await api.delete(`/training/${id}`);
      if (res.status === 200) {
        // Обновляем список, удаляя запись из стейта
        setTrainings(trainings.filter(t => t.id !== id));
        // Если записей не осталось на странице, перезагружаем данные
        if (trainings.length === 1 && currentPage > 1) {
          updateFilters("page", String(currentPage - 1));
        } else {
          loadTrainings(searchParams, selectedDate);
        }
      }
    } catch (err) {
      console.error("Ошибка при удалении:", err);
      alert("Не удалось удалить запись");
    }
  };

  // Логика календаря
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const offset = new Date(currentYear, currentMonth, 1).getDay() === 0 ? 6 : new Date(currentYear, currentMonth, 1).getDay() - 1;

  return (
    <div style={{ padding: "2rem", minHeight: "100vh", background: "#f3f4f6", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* ФИЛЬТРЫ */}
        <div style={{ background: "white", padding: "1.5rem", borderRadius: "20px", marginBottom: "2rem", display: "flex", gap: "1rem", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
          <input type="text" placeholder="Поиск в заметках..." value={searchQuery} onChange={(e) => updateFilters("search", e.target.value)} style={inputStyle} />
          <select value={filterSection} onChange={(e) => updateFilters("section_id", e.target.value)} style={inputStyle}>
            <option value="">Все секции</option>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={sortQuery} onChange={(e) => updateFilters("sort", e.target.value)} style={inputStyle}>
            <option value="date_desc">Сначала новые</option>
            <option value="date_asc">Сначала старые</option>
            <option value="intensity_desc">Высокая нагрузка</option>
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem" }}>
          
          {/* КАЛЕНДАРЬ */}
          <div style={{ background: "white", borderRadius: "24px", padding: "2rem", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} style={navBtnStyle}>&lt;</button>
              <h2 style={{ margin: 0, color: "#1f2937", textTransform: 'capitalize', fontSize: '1.2rem' }}>
                {viewDate.toLocaleString('ru', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} style={navBtnStyle}>&gt;</button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
              {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(d => <div key={d} style={{ textAlign: 'center', fontWeight: 'bold', color: '#9ca3af', fontSize: '0.8rem' }}>{d}</div>)}
              {Array(offset).fill(0).map((_, i) => <div key={`off-${i}`} />)}
              {Array(daysInMonth).fill(0).map((_, i) => {
                const day = i + 1;
                const dateObj = new Date(currentYear, currentMonth, day);
                const isSelected = formatDateKey(dateObj) === formatDateKey(selectedDate);
                return (
                  <div key={day} onClick={() => setSelectedDate(dateObj)}
                    style={{ height: "50px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", cursor: "pointer", background: isSelected ? "#2563eb" : "transparent", color: isSelected ? "white" : "#374151" }}>
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* СПИСОК С КНОПКОЙ УДАЛЕНИЯ */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ background: "white", borderRadius: "24px", padding: "1.5rem", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
              <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>{selectedDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</h3>
              
              <div style={{ minHeight: '100px' }}>
                {trainings.length === 0 ? (
                  <p style={{ color: "#9ca3af", fontSize: "0.9rem", textAlign: 'center', marginTop: '20px' }}>Записей не найдено.</p>
                ) : (
                  trainings.map(t => (
                    <div key={t.id} style={{ padding: "12px", background: "#f8fafc", borderRadius: "12px", marginBottom: "10px", border: "1px solid #e2e8f0", position: 'relative' }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ fontWeight: "bold", color: "#1e40af" }}>{t.section}</div>
                        {/* КНОПКА УДАЛЕНИЯ */}
                        <button 
                          onClick={() => handleDelete(t.id)} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '0 5px', color: '#ef4444' }}
                          title="Удалить запись"
                        >
                          🗑️
                        </button>
                      </div>
                      
                      {t.file_url && (
                        <a href={t.file_url} target="_blank" rel="noreferrer">
                          <img 
                            src={t.file_url} 
                            alt="отчет" 
                            style={{ width: "100%", borderRadius: "8px", marginTop: "8px", marginBottom: '8px', objectFit: 'cover', maxHeight: '180px' }} 
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        </a>
                      )}
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>⏱ {t.duration} мин | 🔥 {t.intensity}/10</div>
                      {t.note && <div style={{ fontSize: "0.8rem", marginTop: '5px', fontStyle: 'italic', color: '#4b5563' }}>{t.note}</div>}
                    </div>
                  ))
                )}
              </div>

              {/* ПАГИНАЦИЯ */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: 'center', gap: "15px", marginTop: "1rem", borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <button disabled={currentPage <= 1} onClick={() => updateFilters("page", String(currentPage - 1))} style={pageBtnStyle}>Назад</button>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{currentPage} / {totalPages}</span>
                <button disabled={currentPage >= totalPages} onClick={() => updateFilters("page", String(currentPage + 1))} style={pageBtnStyle}>Вперед</button>
              </div>
            </div>

            {/* ФОРМА */}
            <div style={{ background: "#2563eb", borderRadius: "24px", padding: "1.5rem", color: "white" }}>
              <form onSubmit={addTraining} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <select value={form.section_id} onChange={e => setForm({...form, section_id: e.target.value})} style={selectStyle}>
                  <option value="">Выберите секцию</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input type="text" placeholder="Заметка..." value={form.note} onChange={e => setForm({...form, note: e.target.value})} style={selectStyle} />
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} style={{ fontSize: "0.8rem" }} />
                <button type="submit" disabled={isUploading} style={btnStyle}>
                  {isUploading ? "Загрузка..." : "Сохранить"}
                </button>
                {message && <div style={{ fontSize: "0.8rem", textAlign: "center", marginTop: '5px' }}>{message}</div>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle = { padding: "10px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "0.9rem", flex: 1, outline: 'none' };
const selectStyle = { ...inputStyle, border: 'none', width: '100%' };
const navBtnStyle = { background: "white", border: "1px solid #e5e7eb", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer" };
const btnStyle = { padding: "12px", borderRadius: "10px", border: "none", backgroundColor: "white", color: "#2563eb", fontWeight: "bold", cursor: "pointer" };
const pageBtnStyle = { background: 'white', border: '1px solid #e5e7eb', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' };

export default Diary;