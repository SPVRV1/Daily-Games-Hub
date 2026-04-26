import "../pages/Home.css";

type NavbarProps = {
    dark: boolean;
    onToggleTheme: () => void;
    activeLink?: "home" | "friends" | "statistics";
};

export default function Navbar({ dark, onToggleTheme, activeLink = "home" }: NavbarProps) {
    return (
        <nav className="navbar">
            <span className="navbar-brand">Daily Games Hub</span>
            <div className="navbar-links">
                <a href="#" className={`nav-link${activeLink === "home" ? " active" : ""}`}>Home</a>
                <a href="#" className={`nav-link${activeLink === "friends" ? " active" : ""}`}>Friends</a>
                <a href="#" className={`nav-link${activeLink === "statistics" ? " active" : ""}`}>Statistics</a>
            </div>
            <div className="navbar-right">
                <button className="icon-btn" aria-label="Toggle theme" onClick={onToggleTheme}>
                    {dark ? (
                        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </button>
                <button className="icon-btn" aria-label="Notifications">
                    <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="notif-dot" />
                </button>
                <a href="/profile" className="icon-btn" aria-label="Profile">
                    <div className="avatar">Z</div>
                </a>
                <button className="icon-btn" aria-label="Logout">
                    <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </nav>
    );
}