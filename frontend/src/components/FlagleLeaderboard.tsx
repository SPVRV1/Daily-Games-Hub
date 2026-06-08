import { useState, useEffect } from "react";
import "./FlagleLeaderboard.css";

const API = import.meta.env.VITE_API_URL ?? "";

interface LeaderboardUser {
    username: string;
    current_streak: number;
    longest_streak: number;
    games_played: number;
    avatar_file_id?: string;
}

type SortKey = "games_played" | "current_streak" | "longest_streak";

const COLUMNS: { key: SortKey; label: string }[] = [
    { key: "games_played", label: "Games" },
    { key: "current_streak", label: "Streak 🔥" },
    { key: "longest_streak", label: "Best streak" },
];

export default function FlagleLeaderboard() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<SortKey>("current_streak");

    useEffect(() => {
        fetch(`${API}/api/user/leaderboard`)
            .then((r) => r.json())
            .then((data) => {
                if (data.ok) setUsers(data.users);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const sorted = [...users].sort((a, b) => b[sortBy] - a[sortBy]);

    return (
        <div className="flb-container">
            <div className="flb-header">
                <h2 className="flb-title">Leaderboard</h2>
                <div className="flb-sort-tabs">
                    {COLUMNS.map((col) => (
                        <button
                            key={col.key}
                            className={`flb-sort-tab ${sortBy === col.key ? "active" : ""}`}
                            onClick={() => setSortBy(col.key)}
                        >
                            {col.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <p className="flb-loading">Loading...</p>
            ) : sorted.length === 0 ? (
                <p className="flb-loading">No players yet.</p>
            ) : (
                <div className="flb-list">
                    {sorted.map((user, i) => (
                        <div key={user.username} className={`flb-row ${i < 3 ? `flb-row--top${i + 1}` : ""}`}>
                            <span className="flb-rank">{i + 1}</span>
                            <div className="flb-avatar">
                                {user.avatar_file_id ? (
                                    <img
                                        src={`${API}/api/user/avatar/${user.avatar_file_id}`}
                                        alt={user.username}
                                    />
                                ) : (
                                    <span>{user.username[0]?.toUpperCase()}</span>
                                )}
                            </div>
                            <span className="flb-username">{user.username}</span>
                            <div className="flb-stats">
                                <span className="flb-stat" title="Games played">{user.games_played} <small>games</small></span>
                                <span className="flb-stat flb-stat--streak" title="Current streak">{user.current_streak} 🔥</span>
                                <span className="flb-stat" title="Longest streak">{user.longest_streak} <small>best</small></span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
