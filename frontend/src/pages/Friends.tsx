import { useState } from "react";
import "./Friends.css";

// Backend endpoints for friendships are prepared and tested:
//
// POST   /api/friends/request
// GET    /api/friends/:userId
// GET    /api/friends/:userId/requests
// PATCH  /api/friends/:friendshipId/status
// DELETE /api/friends/:friendshipId

//example info
// backend call:
// GET /api/friends/:userId
const FRIENDS = [
  { id: 1, name: "alex_games", streak: 14, games: "5/6", color: "#f38e10" },
  { id: 2, name: "sarah_pro", streak: 21, games: "6/6", color: "#8752f4" },
  { id: 3, name: "mike_master", streak: 7, games: "4/6", color: "#1ca0e2" },
  { id: 4, name: "emma_plays", streak: 30, games: "5/6", color: "#ed4675" },
];

// backend call:
// GET /api/friends/:userId/requests
const REQUESTS = [
  { id: 5, name: "daily_gamer", streak: 5, games: "3/6", color: "#1db756" },
  { id: 6, name: "puzzle_king", streak: 12, games: "6/6", color: "#505cea" },
];

export default function Friends() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState<"friends" | "requests">("friends");
  const [friends, setFriends] = useState(FRIENDS);
  const [search, setSearch] = useState("");

  const filtered = (tab === "friends" ? friends : REQUESTS).filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className={`home${dark ? " dark" : ""}`}>
      {/* Navbar */}
      <nav className="navbar">
        <span className="navbar-brand">
          Daily <span className="brand-games">Games</span>
          <span className="brand-hub">Hub</span>
        </span>
        <div className="navbar-links">
          <a href="#" className="nav-link ">
            Home
          </a>
          <a href="#" className="nav-link active">
            Friends
          </a>
          <a href="#" className="nav-link">
            Statistics
          </a>
        </div>
        <div className="navbar-right">
          <button
            className="icon-btn"
            aria-label="Toggle theme"
            onClick={() => setDark(!dark)}
          >
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

      <main className="content">
        <div className="welcome">
          <h1>Friends</h1>
          <p>Connect with friends and compare your gaming progress</p>
        </div>

        {/* Search */}
        <div className="fp-card fp-search-card">
          <div className="fp-search-row">
            <input
              className="fp-search-input"
              type="text"
              placeholder="Search for friends by username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="fp-search-btn">Search</button>
          </div>
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
                    {/* PATCH /api/friends/:friendshipId/status
                                            Body: { status: "accepted" } or { status: "rejected" }
                                        */}
                    <button className="fp-btn-accept">Accept</button>
                    <button className="fp-btn-decline">Decline</button>
                  </>
                ) : (
                  <>
                    <button className="fp-btn-view">View Profile</button>

                    {/* DELETE /api/friends/:friendshipId*/}
                    <button
                      className="fp-btn-remove"
                      onClick={() =>
                        setFriends((prev) => prev.filter((x) => x.id !== f.id))
                      }
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
