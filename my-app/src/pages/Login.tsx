import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface LoginProps {
  onLogin: (token: string) => void;
}

function Login({ onLogin }: LoginProps) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:5000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(data.token); // обновляем токен в App
        setMessage("✅ Вход выполнен!");
        navigate("/"); // редирект
      } else {
        setMessage(`❌ ${data.error || "Ошибка авторизации"}`);
      }
    } catch {
      setMessage("❌ Ошибка соединения с сервером");
    }
  };

  // ✅ return внутри функции
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Вход</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="text"
            name="username"
            placeholder="Имя пользователя"
            value={formData.username}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-3 rounded-lg font-bold hover:bg-blue-600 transition-colors"
          >
            Войти
          </button>
        </form>

        {message && (
          <p
            className={`mt-5 font-semibold ${
              message.startsWith("❌") ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}

        <p className="mt-6 text-gray-600">
          Нет аккаунта?{" "}
          <Link
            to="/register"
            className="text-blue-500 font-semibold hover:underline"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
