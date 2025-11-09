import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function UsersList() {
  const [users, setUsers] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("❌ Нет токена — пожалуйста, войдите.");
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:5000/users", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (res.ok) {
          setUsers(data.users);
        } else {
          setMessage(`❌ ${data.error || "Ошибка доступа"}`);
        }
      } catch (error) {
        setMessage("❌ Ошибка соединения с сервером");
      }
    };

    fetchUsers();
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Список пользователей</h1>
      {message && <p>{message}</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {users.map((u, i) => (
          <li key={i}>
            {u.username} — {u.email}
          </li>
        ))}
      </ul>
      <p>
        <Link to="/">Назад</Link>
      </p>
    </div>
  );
}

export default UsersList;
