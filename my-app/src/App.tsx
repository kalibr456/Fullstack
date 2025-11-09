import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Sections from "./pages/Sections";
import Diary from "./pages/Diary";
import Register from "./pages/Register";
import About from "./pages/About";
import UsersList from "./pages/UsersList";
import Login from "./pages/Login";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogin = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken); // обновляем состояние
  };

  return (
    <Router>
      <Routes>
        {/* Защищённая главная */}
        <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
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

        {/* Публичные */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />

        {/* если маршрут не найден */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
