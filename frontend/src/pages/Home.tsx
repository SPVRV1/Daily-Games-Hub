import Navbar from "../components/Navbar";
import { useState } from "react";
import "./Home.css";

const STATS = [
    {
        icon: "fi-rr-flame",
        iconColor: "#f38e10",
        label: "Current Streak",
        value: "7 days",
    },
    {
        icon: "fi-rr-gamepad",
        iconColor: "#3377f2",
        label: "Today's Progress",
        value: "3/6",
    },
    {
        icon: "fi-rr-clock",
        iconColor: "#3377f2",
        label: "Total Games Played",
        value: "42",
    },
];

type Game = {
    name: string;
    description: string;
    gradient: string;
    icon: string;
    completed: boolean;
    result?: string;
};

const GAMES: Game[] = [
    {
        name: "Wordle",
        description: "Guess the 5-letter word in 6 attempts",
        gradient: "linear-gradient(135deg, #1db756, #158a40)",
        icon: "/icons/Wordle1.png",
        completed: true,
        result: "completed in 3rd attempt",
    },
    {
        name: "Flagle",
        description: "Identify the country from its flag",
        gradient: "linear-gradient(135deg, #3377f2, #1a5ccf)",
        icon: "/icons/Flagle1.png",
        completed: true,
        result: "Completed in 4th attempt",
    },
    {
        name: "More or Less",
        description: "Compare values and guess which is higher",
        gradient: "linear-gradient(135deg, #f38e10, #d4700a)",
        icon: "/icons/MoreOrLess1.png",
        completed: false,
    },
    {
        name: "Worldle",
        description: "Identify the country from its silhouette",
        gradient: "linear-gradient(135deg, #14b8a6, #0d9488)",
        icon: "/icons/Worldle1.png",
        completed: false,
    },
    {
        name: "Math Sprint",
        description: "Solve math problems as fast as you can",
        gradient: "linear-gradient(135deg, #f5da0f, #f38e10)",
        icon: "/icons/MathSprint1.png",
        completed: true,
        result: "Completed in 1:23",
    },
    {
        name: "Songless",
        description: "Guess the song from a short audio clip",
        gradient: "linear-gradient(135deg, #a855f7, #7c3aed)",
        icon: "/icons/Songless1.png",
        completed: false,
    },
];

export default function Home() {
    const [dark, setDark] = useState(false);

    return (
        <div className={`home${dark ? " dark" : ""}`}>
            {/* Navbar */}
            <nav className="navbar">
                <span className="navbar-brand">Daily Games Hub</span>
                <div className="navbar-links">
                    <a href="/" className="nav-link active">Home</a>
                    <a href="Friends" className="nav-link">Friends</a>
                    <a href="#" className="nav-link">Statistics</a>
                </div>
                <div className="navbar-right">
                    <button className="icon-btn" aria-label="Toggle theme" onClick={() => setDark(!dark)}>
                        {dark ? (
                            /* Sun */
                            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        ) : (
                            /* Half moon */
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
                    <div className="avatar">Z</div>
                    <button className="icon-btn" aria-label="Logout">
                        <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Content */}
            <main className="content">
                {/* Welcome */}
                <div className="welcome">
                    <h1>Welcome back, Gospod Zlahtic!</h1>
                    <p>Complete today's challenges and maintain your streak!</p>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    {STATS.map((s) => (
                        <div
                            className={`stat-card${s.label === "Current Streak" ? " stat-card--streak" : ""}`}
                            key={s.label}
                        >
                            <div className="stat-header">
                                <i
                                    className={`fi ${s.icon} stat-icon`}
                                    style={{ color: s.iconColor }}
                                />
                                <span className="stat-label">{s.label}</span>
                            </div>
                            <div className="stat-value">{s.value}</div>
                        </div>
                    ))}
                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-label">Daily Completion</span>
                        </div>
                        <div className="stat-value">50%</div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: "50%" }} />
                        </div>
                    </div>
                </div>

                {/* Games */}
                <h2 className="section-title">Today's Games</h2>
                <div className="games-grid">
                    {GAMES.map((game) => (
                        <div
                            className={`game-card${game.completed ? " game-card--completed" : ""}`}
                            key={game.name}
                        >
                            <div className="game-banner" style={{ background: game.gradient }}>
                                <img src={game.icon} alt={game.name} className="game-icon-img" />
                                {game.completed && (
                                    <span className="completed-badge">
                                        <i className="fi fi-rr-check" />
                                        Completed
                                    </span>
                                )}
                            </div>
                            <div className={`game-info ${game.completed ? "" : "game-info--pending"}`}>
                                <h3 className="game-name">{game.name}</h3>
                                <p className="game-desc">{game.description}</p>
                                {game.completed ? (
                                    <span className="game-result">
                                        <i className="fi fi-rr-check" />
                                        {game.result}
                                    </span>
                                ) : (
                                    <span className="game-not-played">Play now →</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}