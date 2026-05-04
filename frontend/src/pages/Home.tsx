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
            <Navbar activeLink="home" />

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