//import React from "react";
import { Image, Home, ScanSearch, List } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", icon: <Home size={18} />, path: "/" },
    { label: "Analyze Image", icon: <ScanSearch size={18} />, path: "/analyze" },

    // ✅ USE EXISTING HISTORY PAGE
    { label: "View All Analysis", icon: <List size={18} />, path: "/history" },
  ];

  return (
    <div
      style={{
        width: "240px",
        background: "#0D1B2A",
        color: "white",
        height: "100vh",
        padding: "22px",
        display: "flex",
        flexDirection: "column",
        gap: "30px",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Image size={26} color="#64ffda" />
        <h2 style={{ margin: 0, color: "#E0E1DD" }}>OmniScan AI</h2>
      </div>

      {/* Menu */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              textDecoration: "none",
              color: location.pathname === item.path ? "#64ffda" : "#E0E1DD",
              fontWeight: location.pathname === item.path ? "600" : "400",
              padding: "10px",
              borderRadius: "8px",
              background:
                location.pathname === item.path
                  ? "rgba(255,255,255,0.08)"
                  : "",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
