import React, { useEffect, useState } from "react";
// 1. Импортируем нашу обертку (проверьте путь, если api.ts лежит в src, то путь "../api")
import { apiFetch } from "./api";

interface Section {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  created_at: string;
  sections: Section[];
}

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 2. Используем apiFetch.
    // Он сам подставит токен и сам перекинет на логин, если токен протух.
    apiFetch("/users/")
      .then((res: Response) => {
        if (!res.ok) throw new Error("Ошибка загрузки данных");
        return res.json();
      })
      .then((data: any) => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error(err);
        setError("Не удалось загрузить список участников");
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Загрузка...</div>
    );
  if (error)
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
        {error}
      </div>
    );

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h1
        style={{ textAlign: "center", marginBottom: "2rem", color: "#1f2937" }}
      >
        Наши участники 👥
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {users.map((user) => (
          <div
            key={user.id}
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "1.5rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transition: "transform 0.2s",
            }}
          >
            {/* Аватарка */}
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#e0f2fe",
                color: "#0284c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "1rem",
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>

            <h3 style={{ margin: "0 0 0.5rem 0", color: "#111827" }}>
              {user.username}
            </h3>

            <p
              style={{
                fontSize: "0.85rem",
                color: "#6b7280",
                marginBottom: "1rem",
              }}
            >
              В клубе с {new Date(user.created_at).toLocaleDateString()}
            </p>

            {/* Список секций */}
            <div style={{ width: "100%" }}>
              {user.sections && user.sections.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    justifyContent: "center",
                  }}
                >
                  {user.sections.map((sec) => (
                    <span
                      key={sec.id}
                      style={{
                        fontSize: "0.75rem",
                        padding: "4px 8px",
                        backgroundColor: "#f3f4f6",
                        color: "#374151",
                        borderRadius: "9999px",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      {sec.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#9ca3af",
                    textAlign: "center",
                  }}
                >
                  Пока не записан в секции
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersList;
