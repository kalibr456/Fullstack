import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Sections from "./pages/Sections";
import Diary from "./pages/Diary";
import Register from "./pages/Register";
import About from "./pages/About";
import UsersList from "./pages/UsersList";
import Login from "./pages/Login";

// Компонент для красивой ссылки в меню
const NavLink = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        color: isActive ? "#2563eb" : "#4b5563", // Синий если активен, серый если нет
        fontWeight: isActive ? 700 : 500,
        marginRight: "24px",
        fontSize: "1rem",
        transition: "color 0.2s",
        position: "relative",
      }}
    >
      {children}
      {/* Подчеркивание для активной ссылки */}
      {isActive && (
        <span
          style={{
            position: "absolute",
            bottom: "-4px",
            left: 0,
            width: "100%",
            height: "2px",
            backgroundColor: "#2563eb",
            borderRadius: "2px",
          }}
        />
      )}
    </Link>
  );
};

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const handleLogin = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <Router>
      <div
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          backgroundColor: "#f3f4f6",
          minHeight: "100vh",
        }}
      >
        {/* --- НАВИГАЦИОННАЯ ПАНЕЛЬ --- */}
        <nav
          style={{
            padding: "1rem 2rem",
            backgroundColor: "rgba(255, 255, 255, 0.8)", // Полупрозрачный фон
            backdropFilter: "blur(10px)", // Эффект стекла
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            position: "sticky",
            top: 0,
            zIndex: 100,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* Логотип / Название */}
            <Link
              to="/"
              style={{
                textDecoration: "none",
                marginRight: "40px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginRight: "8px" }}>⚡</div>
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                SportCenter
              </span>
            </Link>

            {/* Ссылки (показываем только если есть токен) */}
            {token && (
              <div style={{ display: "flex" }}>
                <NavLink to="/">Главная</NavLink>
                <NavLink to="/sections">Секции</NavLink>
                <NavLink to="/diary">Дневник</NavLink>
                <NavLink to="/users">Участники</NavLink>
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <NavLink to="/about">О нас</NavLink>

            {token ? (
              <button
                onClick={handleLogout}
                style={{
                  padding: "0.5rem 1.25rem",
                  backgroundColor: "#fee2e2",
                  color: "#ef4444",
                  border: "none",
                  borderRadius: "9999px", // Овальная кнопка
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fecaca")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fee2e2")
                }
              >
                Выйти
              </button>
            ) : (
              <Link to="/login" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    padding: "0.5rem 1.25rem",
                    backgroundColor: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "9999px",
                    cursor: "pointer",
                    fontWeight: 600,
                    boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)",
                  }}
                >
                  Войти
                </button>
              </Link>
            )}
          </div>
        </nav>

        {/* --- КОНТЕНТ --- */}
        <Routes>
          <Route
            path="/"
            element={token ? <Home /> : <Navigate to="/login" />}
          />
          <Route
            path="/sections"
            element={token ? <Sections /> : <Navigate to="/login" />}
          />
          <Route
            path="/diary"
            element={token ? <Diary /> : <Navigate to="/login" />}
          />
          <Route
            path="/users"
            element={token ? <UsersList /> : <Navigate to="/login" />}
          />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
