import { LayoutGrid, ScanSearch, FileClock, LogOut } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import Brand from "./Brand";
import { getUsername } from "../lib/auth";

type NavbarProps = {
  onLogoutClick?: () => void;
};

const navItems = [
  { label: "Dashboard", icon: LayoutGrid, path: "/", end: true },
  { label: "Analyze", icon: ScanSearch, path: "/analyze", end: false },
  { label: "History", icon: FileClock, path: "/history", end: false },
];

export default function Navbar({ onLogoutClick }: NavbarProps) {
  const username = getUsername();

  return (
    <header className="topnav">
      <nav className="topnav-group" aria-label="Main">
        <Brand />
        {navItems.map(({ label, icon: Icon, path, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) => `navlink${isActive ? " active" : ""}`}
            title={label}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="topnav-actions">
        <button className="btn btn-ghost btn-sm" onClick={onLogoutClick} title="Log out">
          <LogOut size={16} />
          <span className="hide-sm">Log out</span>
        </button>
        <Link to="/analyze" className="btn btn-primary btn-sm hide-sm">
          New scan
        </Link>
        {username && (
          <span className="avatar" title={username}>
            {username.slice(0, 1)}
          </span>
        )}
      </div>
    </header>
  );
}
