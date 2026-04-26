import "./Home.css";
import Navbar from "../components/Navbar";

const STATS = [
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="stat-icon flame">
                <path d="M12 2C12 2 7 8 7 13a5 5 0 0 0 10 0c0-5-5-11-5-11z" fill="#f38e10" />
                <path d="M12 8c0 0-2.5 3-2.5 5.5A2.5 2.5 0 0 0 14.5 13.5C14.5 11 12 8 12 8z" fill="#fefce8" />
            </svg>
        ),
        label: "Current Streak",
        value: "7 days",
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="stat-icon check">
                <rect x="3" y="3" width="18" height="18" rx="4" fill="#1db756" opacity="0.15" />
                <path d="M7 12l4 4 6-7" stroke="#1db756" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        label: "Today's Progress",
        value: "3/6",
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="stat-icon clock">
                <circle cx="12" cy="12" r="9" stroke="#505cea" strokeWidth="2" />
                <path d="M12 7v5l3 3" stroke="#505cea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        label: "Total Games Played",
        value: "42",
    },
];

type Game = {
    name: string;
    description: string;
    gradient: string;
    icon: React.ReactNode;
    completed: boolean;
    result?: string;
};

const GAMES: Game[] = [
    {
        name: "Wordle",
        description: "Guess the 5-letter word in 6 attempts",
        gradient: "linear-gradient(135deg, #1db756, #22c55e)",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
                <rect x="3" y="3" width="18" height="18" rx="3" fill="white" opacity="0.2" />
                <text x="12" y="17" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="14" fill="white">W</text>
            </svg>
        ),
        completed: true,
        result: "4 attempts",
    },
    {
        name: "Flagle",
        description: "Identify the country from its flag",
        gradient: "linear-gradient(135deg, #7097f2, #505cea)",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
                <path d="M5 4v16M5 4h10l-2 4h2l-2 4H5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        completed: true,
        result: "2 attempts",
    },
    {
        name: "More or Less",
        description: "Compare values and guess which is higher",
        gradient: "linear-gradient(135deg, #f38e10, #ed4675)",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
                {/* Up arrow (left) */}
                <path d="M7 18V6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M4 9l3-3 3 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {/* Down arrow (right) */}
                <path d="M17 6v12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M14 15l3 3 3-3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        completed: false,
    },
    {
        name: "Worldle",
        description: "Identify the country from its silhouette",
        gradient: "linear-gradient(135deg, #1ca0e2, #3377f2)",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
                <path d="M3 12h18M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9" stroke="white" strokeWidth="1.5" />
            </svg>
        ),
        completed: false,
    },
    {
        name: "Math Sprint",
        description: "Solve math problems as fast as you can",
        gradient: "linear-gradient(135deg, #fbbf24, #f38e10)",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
                <rect x="4" y="2" width="16" height="20" rx="2" stroke="white" strokeWidth="2" />
                <rect x="6" y="4" width="12" height="4" rx="1" fill="white" opacity="0.5" />
                <circle cx="8"  cy="13" r="1" fill="white" />
                <circle cx="12" cy="13" r="1" fill="white" />
                <circle cx="16" cy="13" r="1" fill="white" />
                <circle cx="8"  cy="17" r="1" fill="white" />
                <circle cx="12" cy="17" r="1" fill="white" />
                <circle cx="16" cy="17" r="1" fill="white" />
            </svg>
        ),
        completed: true,
        result: "45s",
    },
    {
        name: "Songless",
        description: "Guess the song from a short audio clip",
        gradient: "linear-gradient(135deg, #8752f4, #c54fce)",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
                <path d="M9 18V6l12-2v12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="2" />
                <circle cx="18" cy="16" r="3" stroke="white" strokeWidth="2" />
            </svg>
        ),
        completed: false,
    },
];

export default function Home() {
    return (
        <div className="home">
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
                        <div className={`stat-card${s.label === "Current Streak" ? " stat-card--streak" : ""}`} key={s.label}>
                            <div className="stat-header">
                                {s.icon}
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
                        <div className={`game-card${game.completed ? " game-card--completed" : ""}`} key={game.name}>
                            <div className="game-banner" style={{ background: game.gradient }}>
                                {game.icon}
                                {game.completed && (
                                    <span className="completed-badge">
                                        <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                                            <path d="M3 8l3.5 3.5L13 5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Completed
                                    </span>
                                )}
                            </div>
                            <div className={`game-info ${game.completed ? "" : "game-info--pending"}`}>
                                <h3 className="game-name">{game.name}</h3>
                                <p className="game-desc">{game.description}</p>
                                {game.completed ? (
                                    <span className="game-result">
                                        <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                                            <path d="M2 8l3.5 3.5L13 4" stroke="#1db756" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
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
