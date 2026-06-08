import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LoadingOverlay from "../components/LoadingOverlay";
import { useUser } from "../context/UserContext";
import "./Home.css";

const API = import.meta.env.VITE_API_URL ?? "";

type Game = {
    name: string;
    description: string;
    gradient: string;
    icon: string;
    route: string;
    completed: boolean;
    attempted: boolean;
    result?: string;
};

const GAME_DEFINITIONS = [
    {
        name: "Wordle",
        description: "Guess the 5-letter word in 6 attempts",
        gradient: "linear-gradient(135deg, #1db756, #158a40)",
        icon: "/icons/Wordle1.png",
        route: "/wordle",
    },
    {
        name: "Flagle",
        description: "Identify the country from its flag",
        gradient: "linear-gradient(135deg, #3377f2, #1a5ccf)",
        icon: "/icons/Flagle1.png",
        route: "/flagle",
    },
    {
        name: "More or Less",
        description: "Compare values and guess which is higher",
        gradient: "linear-gradient(135deg, #f38e10, #d4700a)",
        icon: "/icons/MoreOrLess1.png",
        route: "/moreless",
    },
    {
        name: "Worldle",
        description: "Identify the country from its silhouette",
        gradient: "linear-gradient(135deg, #14b8a6, #0d9488)",
        icon: "/icons/Worldle1.png",
        route: "/worldle",
    },
    {
        name: "Math Sprint",
        description: "Solve math problems as fast as you can",
        gradient: "linear-gradient(135deg, #f5da0f, #f38e10)",
        icon: "/icons/MathSprint1.png",
        route: "/math-sprint",
    },
    {
        name: "Songless",
        description: "Guess the song from a short audio clip",
        gradient: "linear-gradient(135deg, #a855f7, #7c3aed)",
        icon: "/icons/Songless1.png",
        route: "/songless",
    },
];

type TodayGame = {
    title: string;
    completed: boolean;
    attempts: number;
    timeTaken: number;
};

type UserStats = {
    current_streak: number;
    games_played: number;
};

function formatDate(d: Date): string {
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth()).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}-${month}-${year}`;
}

function getMoreLessLocalResult(): { completed: boolean; result: string } | null {
    const today = formatDate(new Date());
    const storageKey = `moreless-moreless-${today}`;
    const finished = localStorage.getItem(`${storageKey}-finished`) === "true";
    if (!finished) return null;

    try {
        const savedResult = localStorage.getItem(`${storageKey}-result`);
        const parsed = savedResult ? JSON.parse(savedResult) : null;
        if (typeof parsed?.score === "number") {
            return { completed: true, result: `Score: ${parsed.score}` };
        }
    } catch { /* ignore */ }

    const score = Number(JSON.parse(localStorage.getItem(`${storageKey}-score`) ?? "0"));
    return { completed: true, result: `Score: ${score * 10}` };
}

function formatGameResult(game: TodayGame): string {
    if (!game.completed) return "Failed";
    if (game.timeTaken > 0) {
        const mins = Math.floor(game.timeTaken / 60);
        const secs = game.timeTaken % 60;
        if (mins > 0) return `Completed in ${mins}:${String(secs).padStart(2, "0")}`;
        return `Completed in ${game.timeTaken}s`;
    }
    if (game.attempts > 0) return `Completed in ${game.attempts} attempt${game.attempts !== 1 ? "s" : ""}`;
    return "Completed";
}

export default function Home() {
    const { user } = useUser();
    const navigate = useNavigate();

    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [todayGames, setTodayGames] = useState<TodayGame[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoaded(true);
            return;
        }
        const headers = { Authorization: `Bearer ${token}` };

        Promise.all([
            fetch(`${API}/api/user/data`, { headers }).then((r) => r.json()).catch(() => null),
            fetch(`${API}/api/user/data/today`, { headers }).then((r) => r.json()).catch(() => null),
        ]).then(([userData, todayData]) => {
            if (userData?.ok) {
                setUserStats({
                    current_streak: userData.user.current_streak ?? 0,
                    games_played: userData.user.games_played ?? 0,
                });
            }
            if (todayData?.ok) {
                setTodayGames(todayData.games ?? []);
            }
            setLoaded(true);
        });
    }, []);

    // Merge API today-games with localStorage MoreLess result
    const moreLessLocal = getMoreLessLocalResult();

    const games: Game[] = GAME_DEFINITIONS.map((def) => {
        // Check API data first
        const apiGame = todayGames.find(
            (g) => g.title.toLowerCase() === def.name.toLowerCase()
        );

        if (apiGame) {
            return {
                ...def,
                completed: apiGame.completed,
                attempted: true,
                result: formatGameResult(apiGame),
            };
        }

        // MoreLess fallback: localStorage
        if (def.name === "More or Less" && moreLessLocal) {
            return {
                ...def,
                completed: moreLessLocal.completed,
                attempted: true,
                result: moreLessLocal.result,
            };
        }

        return { ...def, completed: false, attempted: false };
    });

    const completedCount = games.filter((g) => g.completed).length;
    const attemptedCount = games.filter((g) => g.attempted).length;
    const totalGames = games.length;
    const completionPct = Math.round((attemptedCount / totalGames) * 100);

    const streak = userStats?.current_streak ?? 0;
    const totalPlayed = userStats?.games_played ?? 0;

    const STATS = [
        {
            icon: "fi-rr-flame",
            iconColor: "#f38e10",
            label: "Current Streak",
            value: streak > 0 ? `${streak} day${streak !== 1 ? "s" : ""}` : loaded ? "0 days" : "—",
            streakCard: true,
        },
        {
            icon: "fi-rr-gamepad",
            iconColor: "#3377f2",
            label: "Today's Progress",
            value: `${attemptedCount}/${totalGames}`,
            streakCard: false,
        },
        {
            icon: "fi-rr-clock",
            iconColor: "#3377f2",
            label: "Total Games Played",
            value: loaded ? String(totalPlayed) : "—",
            streakCard: false,
        },
    ];

    const displayName = user?.username ?? "Player";

    return (
        <div className="home">
            <Navbar activeLink="home" />

            <LoadingOverlay isLoading={!loaded}>
            <main className="content">
                <div className="welcome">
                    <h1>Welcome back, {displayName}!</h1>
                    <p>Complete today's challenges and maintain your streak!</p>
                </div>

                <div className="stats-grid">
                    {STATS.map((s) => (
                        <div
                            className={`stat-card${s.streakCard ? " stat-card--streak" : ""}`}
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
                        <div className="stat-value">{completionPct}%</div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${completionPct}%` }} />
                        </div>
                    </div>
                </div>

                <h2 className="section-title">Today's Games</h2>
                <div className="games-grid">
                    {games.map((game) => (
                        <div
                            className={`game-card${game.completed ? " game-card--completed" : ""}`}
                            key={game.name}
                            onClick={() => navigate(game.route)}
                        >
                            <div className="game-banner" style={{ background: game.gradient }}>
                                <img src={game.icon} alt={game.name} className="game-icon-img" />
                                {game.completed && (
                                    <span className="completed-badge">
                                        <i className="fi fi-rr-check" />
                                        Completed
                                    </span>
                                )}
                                {!game.completed && game.attempted && (
                                    <span className="completed-badge completed-badge--failed">
                                        <i className="fi fi-rr-cross" />
                                        Failed
                                    </span>
                                )}
                            </div>
                            <div className={`game-info ${game.completed ? "" : "game-info--pending"}`}>
                                <h3 className="game-name">{game.name}</h3>
                                <p className="game-desc">{game.description}</p>
                                {game.completed || game.attempted ? (
                                    <span className={`game-result${game.completed ? "" : " game-result--failed"}`}>
                                        <i className={game.completed ? "fi fi-rr-check" : "fi fi-rr-cross"} />
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
            </LoadingOverlay>
        </div>
    );
}
