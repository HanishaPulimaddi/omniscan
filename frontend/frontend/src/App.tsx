import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Do not show sidebar/navbar on login & register pages
  const hideLayout =
    location.pathname === "/login" || location.pathname === "/register";

  if (hideLayout) {
    return (
      <div style={{ background: "#F5F7FA", minHeight: "100vh" }}>
        <Outlet />
      </div>
    );
  }

  // ✅ Navbar → History navigation
  const goToHistory = () => {
    navigate("/history");
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div style={{ flex: 1, background: "#F8F9FA", minHeight: "100vh" }}>
        <Navbar onHistoryClick={goToHistory} />
        <div style={{ padding: "25px" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
