import Navbar from "./components/Navbar";
import { Announcement } from "./components/Brand";
import { logout } from "./lib/auth";
import { Outlet, useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <Announcement />
      <Navbar onLogoutClick={handleLogout} />
      <main className="page">
        <Outlet />
      </main>
    </>
  );
}
