import React, { useState, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";

// ПАТТЕРН: Lazy Loading (Пункт 4.1 задания)
// Мы заменяем обычные импорты на динамические
const Home = lazy(() => import("./pages/Home"));
const Sections = lazy(() => import("./pages/Sections"));
const Diary = lazy(() => import("./pages/Diary"));
const Register = lazy(() => import("./pages/Register"));
const About = lazy(() => import("./pages/About"));
const UsersList = lazy(() => import("./pages/UsersList"));
const Login = lazy(() => import("./pages/Login"));

// Компонент для красивой ссылки в меню (остается без изменений)
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
        color: isActive ? "#2563eb" : "#4b5563",
        fontWeight: isActive ? 700 : 500,
        marginRight: "24px",
        fontSize: "1rem",
        transition: "color 0.2s",
        position: "relative",
      }}
    >
      {children}
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
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));

  const handleLogin = (newToken: string, newRole: string) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);
    setToken(newToken);
    setRole(newRole);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
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
        {/* --- НАВИГАЦИЯ --- */}
        <nav
          style={{
            padding: "1rem 2rem",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
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
            <Link to="/" style={{ textDecoration: "none", marginRight: "40px", display: "flex", alignItems: "center" }}>
              <div style={{ fontSize: "1.5rem", marginRight: "8px" }}>⚡</div>
              <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111827" }}>SportCenter</span>
            </Link>

            {token && (
              <div style={{ display: "flex" }}>
                <NavLink to="/">Главная</NavLink>
                <NavLink to="/sections">Секции</NavLink>
                <NavLink to="/diary">Дневник</NavLink>
                {role === "admin" && <NavLink to="/users">Участники</NavLink>}
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
                  borderRadius: "9999px",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
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
                  }}
                >
                  Войти
                </button>
              </Link>
            )}
          </div>
        </nav>

        {/* --- КОНТЕНТ С ПОДДЕРЖКОЙ ЛЕНИВОЙ ЗАГРУЗКИ --- */}
        {/* Suspense показывает fallback (индикатор загрузки), пока подгружается файл страницы */}
        <Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: '#6b7280' }}>
            <div style={{ textAlign: 'center' }}>
                <h3>Загрузка модуля...</h3>
                <p>Пожалуйста, подождите</p>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
            <Route path="/sections" element={token ? <Sections /> : <Navigate to="/login" />} />
            <Route path="/diary" element={token ? <Diary /> : <Navigate to="/login" />} />
            <Route
              path="/users"
              element={token && role === "admin" ? <UsersList /> : <Navigate to="/" />}
            />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;