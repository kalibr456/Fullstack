import React, { useState } from "react";

interface DiaryEntry {
  date: string;
  section: string;
  note: string;
}

const Diary: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [form, setForm] = useState<DiaryEntry>({ date: "", section: "", note: "" });

  const addEntry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.date || !form.section) return;
    setEntries([...entries, form]);
    setForm({ date: "", section: "", note: "" });
  };

  return (
    <div
      style={{
        padding: "2rem",
        background: "linear-gradient(135deg, #e0f7fa, #fff)",
        minHeight: "100vh",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#1f2937" }}>
        📓 Дневник тренировок
      </h1>

      <form
        onSubmit={addEntry}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "400px",
          margin: "2rem auto",
          background: "white",
          padding: "1.5rem",
          borderRadius: "12px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
        }}
      >
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid #d1d5db" }}
        />
        <input
          type="text"
          placeholder="Секция (например, Йога)"
          value={form.section}
          onChange={(e) => setForm({ ...form, section: e.target.value })}
          style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid #d1d5db" }}
        />
        <textarea
          placeholder="Комментарий"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          style={{
            padding: "0.5rem",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            resize: "none",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "0.7rem",
            borderRadius: "8px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
        >
          Добавить запись
        </button>
      </form>

      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {entries.map((e, i) => (
          <div
            key={i}
            style={{
              background: "white",
              padding: "1rem",
              marginBottom: "1rem",
              borderRadius: "10px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            }}
          >
            <h3>
              {e.date} — {e.section}
            </h3>
            <p style={{ color: "#4b5563" }}>{e.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Diary;
