import React, { useEffect, useState } from "react";

interface Section {
  id: number;
  name: string;
}

const Sections: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  // GET: загружаем секции с бекенда
  useEffect(() => {
    fetch("http://127.0.0.1:5000/sections/")
      .then((res) => res.json())
      .then((data) => setSections(data.sections))
      .catch((err) => console.error("Ошибка при загрузке секций:", err));
  }, []);

  // POST: отправка выбранной секции на бекенд
  const handleSelect = (sec: Section) => {
    setSelected(sec.name);

    fetch("http://127.0.0.1:5000/sections/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: sec.name, user: "ivan" }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Запись сохранена:", data))
      .catch((err) => console.error("Ошибка при записи:", err));
  };

  return (
    <div style={{ padding: "2rem", minHeight: "100vh", background: "#f8fafc" }}>
      <h1>Выберите секцию</h1>

      {sections.length === 0 && <p>Загрузка секций...</p>}

      {sections.map((sec) => (
        <div
          key={sec.id}
          onClick={() => handleSelect(sec)}
          style={{
            padding: "1rem",
            margin: "0.5rem 0",
            backgroundColor: selected === sec.name ? "#bfdbfe" : "white",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          <h3>{sec.name}</h3>
        </div>
      ))}

      {selected && <p>✅ Вы записались в секцию: {selected}</p>}
    </div>
  );
};

export default Sections;

