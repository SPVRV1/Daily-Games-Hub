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
        icon: "fi-rr-file-word",
        completed: true,
        result: "completed in 3rd attempt",
    },
    {
        name: "Flagle",
        description: "Identify the country from its flag",
        gradient: "linear-gradient(135deg, #3377f2, #1a5ccf)",
        icon: "fi-rr-flag",
        completed: true,
        result: "Completed in 4th attempt",
    },
    {
        name: "More or Less",
        description: "Compare values and guess which is higher",
        gradient: "linear-gradient(135deg, #f38e10, #ffbb69ff)",
        icon: "fi-rr-balance-scale-left",
        completed: false,
    },
    {
        name: "Worldle",
        description: "Identify the country from its silhouette",
        gradient: "linear-gradient(135deg, #1ca0e2, #5ac8ffff)",
        icon: "fi-rr-globe",
        completed: false,
    },
    {
        name: "Math Sprint",
        description: "Solve math problems as fast as you can",
        gradient: "linear-gradient(135deg, #f38e10, #f5da0f)",
        icon: "fi-rr-calculator",
        completed: true,
        result: "Completed in 1:23",
    },
    {
        name: "Songless",
        description: "Guess the song from a short audio clip",
        gradient: "linear-gradient(135deg, #8752f4, #ae85ffff)",
        icon: "fi-rr-headphones",
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
                    <a href="#" className="nav-link active">Home</a>
                    <a href="#" className="nav-link">Friends</a>
                    <a href="#" className="nav-link">Statistics</a>
                </div>
                <div className="navbar-right">
                    <button className="icon-btn" aria-label="Toggle theme" onClick={() => setDark(!dark)}>
                        <i className={`fi ${dark ? "fi-rr-sun" : "fi-rr-moon"}`} />
                    </button>
                    <button className="icon-btn" aria-label="Notifications">
                        <i className="fi fi-rr-bell" />
                        <span className="notif-dot" />
                    </button>
                    <div className="avatar">Z</div>
                    <button className="icon-btn" aria-label="Logout">
                        <i className="fi fi-rr-sign-out-alt" />
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
                                <i className={`fi ${game.icon}`} />
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
