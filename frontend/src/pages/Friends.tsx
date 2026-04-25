import { useState } from "react";
import "./Friends.css";

//example info
const FRIENDS = [
    { id: 1, name: "alex_games",  streak: 14, games: "5/6", color: "#f38e10" },
    { id: 2, name: "sarah_pro",   streak: 21, games: "6/6", color: "#8752f4" },
    { id: 3, name: "mike_master", streak: 7,  games: "4/6", color: "#1ca0e2" },
    { id: 4, name: "emma_plays",  streak: 30, games: "5/6", color: "#ed4675" },
];

const REQUESTS = [
    { id: 5, name: "daily_gamer", streak: 5,  games: "3/6", color: "#1db756" },
    { id: 6, name: "puzzle_king", streak: 12, games: "6/6", color: "#505cea" },
];

export default function Friends() {
    const [dark, setDark]       = useState(false);
    const [tab, setTab]         = useState<"friends" | "requests">("friends");
    const [friends, setFriends] = useState(FRIENDS);

    const filtered = tab === "friends" ? friends : REQUESTS;

    return (
        <div className={`home${dark ? " dark" : ""}`}>
            {/* Navbar */}
            <nav className="navbar">
                <span className="navbar-brand">Daily Games Hub</span>
                <div className="navbar-links">
                    <a href="/" className="nav-link">Home</a>
                    <a href="Friends" className="nav-link active">Friends</a>
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

            <main className="content">
                <div className="welcome">
                    <h1>Friends</h1>
                    <p>Connect with friends and compare your gaming progress</p>
                </div>

                {/* Tabs */}
                <div className="fp-tabs">
                    <button
                        className={`fp-tab${tab === "friends" ? " fp-tab--active" : ""}`}
                        onClick={() => setTab("friends")}
                    >
                        My Friends ({friends.length})
                    </button>
                    <button
                        className={`fp-tab${tab === "requests" ? " fp-tab--active" : ""}`}
                        onClick={() => setTab("requests")}
                    >
                        Friend Requests
                        <span className="fp-badge">{REQUESTS.length}</span>
                    </button>
                </div>

                {/* List */}
                <div className="fp-card">
                    {filtered.map((f, i) => (
                        <div
                            className={`fp-row${i < filtered.length - 1 ? " fp-row--border" : ""}`}
                            key={f.id}
                        >
                            <div className="fp-avatar" style={{ background: f.color }}>
                                {f.name[0].toUpperCase()}
                            </div>
                            <div className="fp-info">
                                <span className="fp-name">{f.name}</span>
                                <div className="fp-meta">
                                    <span className="fp-streak">🔥 {f.streak} days</span>
                                    <span className="fp-games">🏆 {f.games} today</span>
                                </div>
                            </div>
                            <div className="fp-actions">
                                {tab === "requests" ? (
                                    <>
                                        <button className="fp-btn-view">Accept</button>
                                        <button className="fp-btn-remove">Decline</button>
                                    </>
                                ) : (
                                    <>
                                        <button className="fp-btn-view">View Profile</button>
                                        <button
                                            className="fp-btn-remove"
                                            onClick={() => setFriends(prev => prev.filter(x => x.id !== f.id))}
                                        >
                                            Remove
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <p className="fp-empty">No results found.</p>
                    )}
                </div>
            </main>
        </div>
    );
}