import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import "./Statistics.css";

type TimePeriod = "today" | "week" | "month" | "alltime";
type GameType = "all" | "wordle" | "flagle" | "math";

interface Player {
    rank: number;
    username: string;
    score: number;
    games: number;
    streak: number;
    initial: string;
    color: string;
}

const MOCK_PLAYERS: Player[] = [
    { rank: 1, username: "emma_plays",  score: 9850, games: 201, streak: 24, initial: "E", color: "#f38e10" },
    { rank: 2, username: "sarah_pro",   score: 9200, games: 168, streak: 18, initial: "S", color: "#505cea" },
    { rank: 3, username: "alex_games",  score: 8750, games: 155, streak: 15, initial: "A", color: "#ed4675" },
    { rank: 4, username: "mike_master", score: 8500, games: 168, streak: 18, initial: "M", color: "#1ca0e2" },
    { rank: 5, username: "lisa_wang",   score: 8300, games: 162, streak: 12, initial: "L", color: "#1db756" },
    { rank: 6, username: "john_doe",    score: 7900, games: 140, streak: 9,  initial: "J", color: "#8752f4" },
    { rank: 7, username: "nina_swift",  score: 7500, games: 130, streak: 7,  initial: "N", color: "#f38e10" },
];

export default function Statistics() {
    const [period, setPeriod] = useState<TimePeriod>("today");
    const [gameType, setGameType] = useState<GameType>("all");
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(t);
    }, []);

    const top3 = MOCK_PLAYERS.slice(0, 3);
    const rest = MOCK_PLAYERS.slice(3);

    return (
        <div className="stats-page">
            <Navbar activeLink="statistics" />

            <main className="stats-content">
                {/* Header */}
                <div className="stats-heading">
                    <span className="stats-trophy">🏆</span>
                    <div>
                        <h1 className="stats-title">Global Leaderboard</h1>
                        <p className="stats-subtitle">See how you rank against players worldwide</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="stats-filters">
                    <div className="filter-group">
                        <span className="filter-label">Time Period</span>
                        <div className="filter-buttons">
                            {(["today","week","month","alltime"] as TimePeriod[]).map((p) => (
                                <button
                                    key={p}
                                    className={`filter-btn${period === p ? " filter-btn--active" : ""}`}
                                    onClick={() => setPeriod(p)}
                                >
                                    {p === "alltime" ? "All Time" : p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="filter-divider"></div>
                    <div className="filter-group">
                        <span className="filter-label">Game Type</span>
                        <div className="filter-buttons">
                            {(["all","wordle","flagle","math"] as GameType[]).map((g) => (
                                <button
                                    key={g}
                                    className={`filter-btn${gameType === g ? " filter-btn--active" : ""}`}
                                    onClick={() => setGameType(g)}
                                >
                                    {g === "all" ? "All Games" : g.charAt(0).toUpperCase() + g.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Podium */}
                <div className="podium-wrap">
                    <div className={`podium-player podium-player--2${animated ? " podium-player--visible" : ""}`}>
                        <div className="podium-avatar" style={{ background: top3[1].color }}>{top3[1].initial}</div>
                        <div className="podium-username">{top3[1].username}</div>
                        <div className="podium-score">{top3[1].score.toLocaleString()}</div>
                        <div className="podium-block podium-block--2">2nd</div>
                    </div>
                    <div className={`podium-player podium-player--1${animated ? " podium-player--visible" : ""}`}>
                        <div className="podium-crown">👑</div>
                        <div className="podium-avatar podium-avatar--1" style={{ background: top3[0].color }}>{top3[0].initial}</div>
                        <div className="podium-username">{top3[0].username}</div>
                        <div className="podium-score podium-score--1">{top3[0].score.toLocaleString()}</div>
                        <div className="podium-block podium-block--1">1st</div>
                    </div>
                    <div className={`podium-player podium-player--3${animated ? " podium-player--visible" : ""}`}>
                        <div className="podium-avatar" style={{ background: top3[2].color }}>{top3[2].initial}</div>
                        <div className="podium-username">{top3[2].username}</div>
                        <div className="podium-score">{top3[2].score.toLocaleString()}</div>
                        <div className="podium-block podium-block--3">3rd</div>
                    </div>
                </div>

                {/* Rankings */}
                <div className="rankings-wrap">
                    <div className="rankings-header">Rankings</div>
                    {rest.map((player) => (
                        <div className="ranking-row" key={player.username}>
                            <span className="ranking-rank">{player.rank}</span>
                            <div className="ranking-avatar" style={{ background: player.color }}>{player.initial}</div>
                            <div className="ranking-info">
                                <span className="ranking-username">{player.username}</span>
                                <span className="ranking-meta">
                                    <span>📈 {player.games} games</span>
                                    <span>🔥 {player.streak} days</span>
                                </span>
                            </div>
                            <div className="ranking-score">
                                <span className="ranking-points">{player.score.toLocaleString()}</span>
                                <span className="ranking-points-label">points</span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}