import { User, LogOut } from "lucide-react";

type NavbarProps = {
  onHistoryClick?: () => void;
  onLogoutClick?: () => void;
};

export default function Navbar({ onHistoryClick, onLogoutClick }: NavbarProps) {
  return (
    <div
      style={{
        height: "60px",
        background: "white",
        padding: "0 25px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #e5e5e5",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
        Dashboard
      </h2>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Profile / User Icon */}
        <div
          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          title="View History"
          onClick={onHistoryClick}
        >
          <User size={22} />
        </div>

        {/* Logout */}
        <div
          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          title="Logout"
          onClick={onLogoutClick}
        >
          <LogOut size={22} />
        </div>
      </div>
    </div>
  );
}
