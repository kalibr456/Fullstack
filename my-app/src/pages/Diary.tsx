import React, { useState, useEffect } from "react";

interface Training {
  user: string;
  section: string;
  duration: number;
  intensity: number;
}

const Training: React.FC = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [form, setForm] = useState<Training>({
    user: "",
    section: "",
    duration: 30,
    intensity: 5,
  });

  useEffect(() => {
    fetch("http://127.0.0.1:5000/training/")
      .then((res) => res.json())
      .then((data) => setTrainings(data.trainings))
      .catch((err) => console.error("Ошибка при загрузке тренировок:", err));
  }, []);

  const addTraining = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.user || !form.section) return;

    fetch("http://127.0.0.1:5000/training/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((data) => {
        setTrainings([...trainings, data.data]);
        setForm({ user: "", section: "", duration: 30, intensity: 5 });
      })
      .catch((err) => console.error("Ошибка при добавлении тренировки:", err));
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
        🏋️‍♂️ Тренировки
      </h1>

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
        <input
          type="text"
          placeholder="Пользователь"
          value={form.user}
          onChange={(e) => setForm({ ...form, user: e.target.value })}
          style={{
            padding: "0.6rem",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
          }}
        />
        <input
          type="text"
          placeholder="Секция"
          value={form.section}
          onChange={(e) => setForm({ ...form, section: e.target.value })}
          style={{
            padding: "0.6rem",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
          }}
        />

        {/* Duration: ползунок */}
        <label>
          Длительность: {form.duration} мин
          <input
            type="range"
            min={10}
            max={180}
            step={5}
            value={form.duration}
            onChange={(e) =>
              setForm({ ...form, duration: Number(e.target.value) })
            }
            style={{ width: "100%" }}
          />
        </label>

        {/* Intensity: ползунок */}
        <label>
          Интенсивность: {form.intensity}/10
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={form.intensity}
            onChange={(e) =>
              setForm({ ...form, intensity: Number(e.target.value) })
            }
            style={{ width: "100%" }}
          />
        </label>

        <button
          type="submit"
          style={{
            padding: "0.7rem",
            borderRadius: "8px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#1d4ed8")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#2563eb")
          }
        >
          Добавить тренировку
        </button>
      </form>

Kalibr, [23.10.2025 1:05]
<div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {trainings.length === 0 && (
          <p style={{ textAlign: "center", color: "#6b7280" }}>
            Список тренировок пуст.
          </p>
        )}
        {trainings.map((t, i) => (
          <div
            key={i}
            style={{
              background: "white",
              padding: "1rem 1.5rem",
              marginBottom: "1rem",
              borderRadius: "12px",
              boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(ev) =>
              (ev.currentTarget.style.transform = "translateY(-3px)")
            }
            onMouseLeave={(ev) =>
              (ev.currentTarget.style.transform = "translateY(0)")
            }
          >
            <h3 style={{ marginBottom: "0.5rem", color: "#1e40af" }}>
              {t.user} — {t.section}
            </h3>
            <p style={{ color: "#4b5563" }}>
              Длительность: {t.duration} мин, Интенсивность: {t.intensity}/10
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Training;