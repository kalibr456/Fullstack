import React, { useEffect, useState } from "react";
import api from "../api"; // Импортируем настроенный axios из Лабораторной №2

interface Section {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  role: string; // Роль пользователя
  created_at: string;
  sections: Section[];
}

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Получаем роль текущего пользователя из хранилища
  const currentRole = localStorage.getItem("role");

  const loadUsers = async () => {
    try {
      // Используем api.get вместо apiFetch.
      // Interceptor автоматически обработает Access Token и Refresh Token.
      const res = await api.get("/users/");
      setUsers(res.data.users || []);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error || "Не удалось загрузить список участников",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Функция смены роли (только для админа)
  const toggleRole = async (user: User) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    if (
      !window.confirm(
        `Изменить роль пользователя ${user.username} на ${newRole}?`,
      )
    )
      return;

    try {
      // Используем защищенный api.put
      await api.put(`/users/${user.id}/role`, { role: newRole });
      loadUsers(); // Перезагружаем список после обновления
    } catch (err: any) {
      alert(err.response?.data?.error || "Ошибка при смене роли");
    }
  };

  if (loading)
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
        Загрузка участников...
      </div>
    );

  if (error)
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#ef4444" }}>
        {error}
      </div>
    );

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1
        style={{
          textAlign: "center",
          marginBottom: "2rem",
          color: "#1f2937",
          fontWeight: 800,
        }}
      >
        Наши участники 👥
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {users.map((user) => (
          <div
            key={user.id}
            style={{
              backgroundColor: "white",
              borderRadius: "20px",
              padding: "1.5rem",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.04)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transition: "transform 0.2s, box-shadow 0.2s",
              border: "1px solid #f3f4f6",
            }}
          >
            {/* Аватарка */}
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                backgroundColor: user.role === "admin" ? "#fee2e2" : "#e0f2fe",
                color: user.role === "admin" ? "#ef4444" : "#0284c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                border: `3px solid ${user.role === "admin" ? "#fecaca" : "#bae6fd"}`,
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>

            <h3 style={{ margin: "0 0 0.25rem 0", color: "#111827" }}>
              {user.username}
            </h3>

            <span
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: 700,
                color: user.role === "admin" ? "#ef4444" : "#9ca3af",
                marginBottom: "0.75rem",
              }}
            >
              {user.role}
            </span>

            <p
              style={{
                fontSize: "0.8rem",
                color: "#6b7280",
                marginBottom: "1.25rem",
              }}
            >
              В клубе с {new Date(user.created_at).toLocaleDateString()}
            </p>

            {/* Кнопка смены роли (видна только если текущий залогиненный юзер — админ) */}
            {currentRole === "admin" && (
              <button
                onClick={() => toggleRole(user)}
                style={{
                  marginBottom: "1.25rem",
                  padding: "6px 16px",
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "#374151",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e5e7eb")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f3f4f6")
                }
              >
                {user.role === "admin" ? "Разжаловать" : "Сделать админом"}
              </button>
            )}

            {/* Список секций */}
            <div
              style={{
                width: "100%",
                borderTop: "1px solid #f3f4f6",
                paddingTop: "1rem",
              }}
            >
              {user.sections && user.sections.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.4rem",
                    justifyContent: "center",
                  }}
                >
                  {user.sections.map((sec) => (
                    <span
                      key={sec.id}
                      style={{
                        fontSize: "0.7rem",
                        padding: "3px 10px",
                        backgroundColor: "#f9fafb",
                        color: "#4b5563",
                        borderRadius: "9999px",
                        border: "1px solid #f3f4f6",
                        fontWeight: 500,
                      }}
                    >
                      {sec.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#9ca3af",
                    textAlign: "center",
                    margin: 0,
                  }}
                >
                  Нет активных секций
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
