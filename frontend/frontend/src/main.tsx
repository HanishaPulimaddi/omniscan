import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Report from "./pages/Report";

import App from "./App";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import History from "./pages/History";
import Login from "./pages/login";
import Register from "./pages/register";

import "./index.css";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}
        {/* No sidebar, no auth shell */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/report/:id" element={<Report />} />

        {/* ================= PROTECTED ROUTES ================= */}
        {/* Wrapped inside App layout (sidebar/navbar) */}
        <Route path="/" element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="analyze" element={<Analyze />} />

          {/* 🔗 Sidebar → View All Analysis */}
          <Route path="history" element={<History />} />
        </Route>

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
