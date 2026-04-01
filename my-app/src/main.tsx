import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async"; // Импортируем провайдер
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* Обертываем всё приложение, чтобы работал компонент SEO */}
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);