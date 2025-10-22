import React, { useState } from "react";
import { Link } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:5000/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ Ошибка: ${data.error || "Не удалось зарегистрироваться"}`);
      }
    } catch (error) {
      setMessage("❌ Ошибка соединения с сервером");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Регистрация</h1>
      <form style={{ marginTop: "1rem" }} onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Имя"
          value={formData.username}
          onChange={handleChange}
        /><br /><br />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        /><br /><br />
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          value={formData.password}
          onChange={handleChange}
        /><br /><br />
        <button type="submit">Зарегистрироваться</button>
      </form>

      {message && <p>{message}</p>}

      <p>
        <Link to="/">Назад на главную</Link>
      </p>
    </div>
  );
}

export default Register;
