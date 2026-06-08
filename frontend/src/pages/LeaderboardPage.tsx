import { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";

interface LeaderboardUser {
  username: string;
  current_streak: number;
  longest_streak: number;
  games_played: number;
  avatar_url?: string;
  avatar_file_id?: string;
}

type SortKey = "current_streak" | "longest_streak" | "games_played";

const MEDALS = ["1", "2", "3"];

const RANK_COLORS_LIGHT = [
  { glow: "#f59e0b", border: "#f59e0b", bg: "rgba(245,158,11,0.08)", text: "#8a5b00" },
  { glow: "#94a3b8", border: "#94a3b8", bg: "rgba(148,163,184,0.07)", text: "#475569" },
  { glow: "#cd7f32", border: "#cd7f32", bg: "rgba(205,127,50,0.08)", text: "#7a4a1e" },
];

const RANK_COLORS_DARK = [
  { glow: "#f59e0b", border: "#f59e0b", bg: "rgba(245,158,11,0.08)", text: "#fde68a" },
  { glow: "#94a3b8", border: "#94a3b8", bg: "rgba(148,163,184,0.07)", text: "#e2e8f0" },
  { glow: "#cd7f32", border: "#cd7f32", bg: "rgba(205,127,50,0.08)", text: "#fcd9a0" },
];

export default function LeaderboardPage() {
  const { isDark } = useTheme();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("current_streak");
  const [search, setSearch] = useState("");
  const [animatedRows, setAnimatedRows] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiBaseUrl}/api/user/leaderboard`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const data = await res.json();
        const arr = Array.isArray(data.users)
          ? data.users
          : Array.isArray(data.leaderboard)
          ? data.leaderboard
          : [];
        setUsers(arr);
        setTimeout(() => setAnimatedRows(true), 100);
      } catch (e: any) {
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [apiBaseUrl]);

  const rankColors = useMemo(() => (isDark ? RANK_COLORS_DARK : RANK_COLORS_LIGHT), [isDark]);

  const sortedUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => b[sortKey] - a[sortKey])
      .filter((u) =>
        search.trim() === "" || u.username.toLowerCase().includes(search.toLowerCase())
      );
  }, [users, sortKey, search]);

  const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
    { key: "current_streak", label: "Current Streak" },
    { key: "longest_streak", label: "Best Streak" },
    { key: "games_played", label: "Games Played" },
  ];

  return (
    <div
      id="LeaderboardPage"
      className="leaderboard-page min-h-screen flex flex-col"
    >
      <style>{`
        .leaderboard-page {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-body);
          transition: background 0.25s ease, color 0.25s ease;
        }

        .leaderboard-page * {
          transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .lb-title {
          font-family: var(--font-heading);
          letter-spacing: 0.08em;
          color: var(--text-dark);
        }

        .lb-row {
          opacity: 0;
          transform: translateX(-24px);
          transition: opacity 0.4s ease, transform 0.4s ease, background 0.2s;
        }
        .lb-row.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .lb-row:hover {
          filter: brightness(1.05);
        }

        .sort-btn {
          border: 1px solid transparent;
          background: var(--card-bg);
          cursor: pointer;
          transition: all 0.18s;
          font-family: var(--font-body);
          color: var(--text);
        }
        .sort-btn.active {
          border-color: var(--primary);
          color: var(--primary) !important;
          background: var(--primary-bg);
        }
        .sort-btn:not(.active):hover {
          border-color: rgba(51, 119, 242, 0.4);
        }

        .search-bar {
          font-family: var(--font-body);
          outline: none;
          background: var(--card-bg);
          border: 1px solid var(--border);
          color: var(--text-dark);
        }
        .search-bar:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 2px rgba(51, 119, 242, 0.12);
        }

        .search-bar::placeholder {
          color: var(--text);
        }

        .rank-badge {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          font-weight: 500;
          font-size: 13px;
          flex-shrink: 0;
        }

        .stat-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 12px;
        }

        .leaderboard-surface {
          background: var(--card-bg);
          border: 1px solid var(--border);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
        }

        .leaderboard-header {
          color: var(--text);
          border-bottom: 1px solid var(--border);
          letter-spacing: 0.08em;
        }

        .top-glow-1 { box-shadow: 0 0 18px 2px rgba(245,158,11,0.18), inset 0 0 0 1px rgba(245,158,11,0.18); }
        .top-glow-2 { box-shadow: 0 0 12px 1px rgba(148,163,184,0.14), inset 0 0 0 1px rgba(148,163,184,0.14); }
        .top-glow-3 { box-shadow: 0 0 12px 1px rgba(205,127,50,0.14), inset 0 0 0 1px rgba(205,127,50,0.12); }
      `}</style>

      <Navbar activeLink="leaderboard" />

      <main className="mx-auto w-full max-w-3xl px-4 py-10">

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            className="search-bar flex-1 px-4 py-2 rounded-lg text-sm"
            placeholder="Search player..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={`sort-btn px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 ${sortKey === opt.key ? "active" : ""}`}
                onClick={() => setSortKey(opt.key)}
              >
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="text-center py-20" style={{ color: "var(--text)" }}>
            <div style={{ letterSpacing: "0.1em", fontSize: 13 }}>LOADING...</div>
          </div>
        )}

        {error && (
          <div
            className="text-center py-10 rounded-xl"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#f87171",
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <div
            className="leaderboard-surface rounded-2xl overflow-hidden"
            style={{ backdropFilter: "blur(12px)" }}
          >
            <div
              className="leaderboard-header grid px-4 py-3 text-xs"
              style={{
                gridTemplateColumns: "48px 1fr repeat(3, 110px)",
              }}
            >
              <span>RANK</span>
              <span>PLAYER</span>
              <span className="text-right">STREAK</span>
              <span className="text-right">BEST</span>
              <span className="text-right">PLAYED</span>
            </div>

            {sortedUsers.length === 0 && (
              <div
                className="text-center py-12 text-sm"
                style={{ color: "var(--text)" }}
              >
                No players found.
              </div>
            )}

            {sortedUsers.map((user, idx) => {
              let avatarUrl = user.avatar_url;
              if (user.avatar_file_id) {
                avatarUrl = `${apiBaseUrl}/api/user/avatar/${user.avatar_file_id}`;
              } else if (avatarUrl && avatarUrl.startsWith("/user/avatar/")) {
                avatarUrl = `${apiBaseUrl}/api${avatarUrl}`;
              }

              const rankStyle = idx < 3 ? rankColors[idx] : null;
              const isTop3 = idx < 3;

              return (
                <div
                  key={user.username}
                  className={`lb-row grid items-center px-4 py-3 ${animatedRows ? "visible" : ""} ${
                    isTop3 ? `top-glow-${idx + 1}` : ""
                  }`}
                  style={{
                    gridTemplateColumns: "48px 1fr repeat(3, 110px)",
                    transitionDelay: `${idx * 55}ms`,
                    background: isTop3 ? rankStyle!.bg : "transparent",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center">
                    {isTop3 ? (
                      <div
                        className="rank-badge"
                        style={{
                          border: `1.5px solid ${rankStyle!.border}`,
                          color: rankStyle!.text,
                          background: `rgba(${idx === 0 ? "245,158,11" : idx === 1 ? "148,163,184" : "205,127,50"},0.1)`,
                          fontSize: 16,
                        }}
                      >
                        {MEDALS[idx]}
                      </div>
                    ) : (
                      <div
                        className="rank-badge"
                        style={{
                          color: "var(--text)",
                          fontSize: 12,
                        }}
                      >
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={user.username}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: isTop3
                            ? `2px solid ${rankStyle!.border}`
                            : "2px solid var(--border)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: isTop3
                            ? `linear-gradient(135deg, ${rankStyle!.border}44, ${rankStyle!.border}22)`
                            : "var(--bg)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: 500,
                          color: isTop3 ? rankStyle!.text : "var(--text)",
                          border: isTop3 ? `2px solid ${rankStyle!.border}55` : "2px solid var(--border)",
                          flexShrink: 0,
                        }}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span
                      style={{
                        fontWeight: isTop3 ? 500 : 400,
                        color: isTop3 ? rankStyle!.text : "var(--text-dark)",
                        fontSize: 14,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {user.username}
                    </span>
                  </div>

                  {/* Stats */}
                  {[
                    { val: user.current_streak, highlight: sortKey === "current_streak" },
                    { val: user.longest_streak, highlight: sortKey === "longest_streak" },
                    { val: user.games_played, highlight: sortKey === "games_played" },
                  ].map((stat, si) => (
                    <div key={si} className="text-right">
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: stat.highlight ? 500 : 400,
                          color: stat.highlight
                            ? isTop3 ? rankStyle!.text : "var(--primary)"
                            : "var(--text)",
                        }}
                      >
                        {stat.val.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer count */}
        {!loading && !error && sortedUsers.length > 0 && (
          <p
            className="text-center mt-4 text-xs"
            style={{ color: "var(--text)", letterSpacing: "0.08em" }}
          >
            {sortedUsers.length} PLAYER{sortedUsers.length !== 1 ? "S" : ""} RANKED
          </p>
        )}
      </main>
    </div>
  );
}