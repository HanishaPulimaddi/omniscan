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
import ProtectedRoute from "./components/ProtectedRoute";

import "./index.css";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}
        {/* No sidebar, no auth shell */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= PROTECTED ROUTES ================= */}
        {/* Redirects to /login if there's no token */}
        <Route element={<ProtectedRoute />}>
          {/* Wrapped inside App layout (top navigation) */}
          <Route path="/" element={<App />}>
            <Route index element={<Dashboard />} />
            <Route path="analyze" element={<Analyze />} />
            <Route path="history" element={<History />} />
            <Route path="report/:id" element={<Report />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
