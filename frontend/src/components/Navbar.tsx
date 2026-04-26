import "../pages/Home.css";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Bell, LogOut, Moon, Sun } from "lucide-react";

type NavbarProps = {
    activeLink?: "home" | "friends" | "statistics";
};

export default function Navbar({ activeLink = "home" }: NavbarProps) {
    const { isDark, toggleTheme } = useTheme();

    return (
        <nav className="navbar">
            <span className="navbar-brand">Daily Games Hub</span>
            <div className="navbar-links">
                <Link to="/" className={`nav-link${activeLink === "home" ? " active" : ""}`}>Home</Link>
                <Link to="/friends" className={`nav-link${activeLink === "friends" ? " active" : ""}`}>Friends</Link>
                <Link to="/statistics" className={`nav-link${activeLink === "statistics" ? " active" : ""}`}>Statistics</Link>
            </div>
            <div className="navbar-right">
                <button className="icon-btn" aria-label="Toggle theme" onClick={toggleTheme}>
                    {isDark ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
                </button>
                <button className="icon-btn" aria-label="Notifications">
                    <Bell size={22} strokeWidth={2} />
                    <span className="notif-dot" />
                </button>
                <Link to="/profile" className="icon-btn" aria-label="Profile">
                    <div className="avatar">Z</div>
                </Link>
                <button className="icon-btn" aria-label="Logout">
                    <LogOut size={22} strokeWidth={2} />
                </button>
            </div>
        </nav>
    );
}