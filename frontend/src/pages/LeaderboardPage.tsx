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

export default function LeaderboardPage() {
  const { isDark } = useTheme();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = useMemo(() => {
    const envPort = import.meta.env.VITE_API_PORT;
    if (envPort) {
      return `http://localhost:${envPort}`;
    }
    return import.meta.env.VITE_API_URL ?? "http://localhost:3000";
  }, []);

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
        console.log(data)
        const arr = Array.isArray(data.users) ? data.users : Array.isArray(data.leaderboard) ? data.leaderboard : [];
        setUsers(arr);
      } catch (e: any) {
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [apiBaseUrl]);

  return (
    <div id="LeaderboardPage" className="min-h-screen flex flex-col" style={{ background: isDark ? "#0f172a" : "#f1f5f9" }}>
      <Navbar activeLink="leaderboard" />
      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Leaderboard</h1>
        {loading && <div className="text-center">Loading...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {!loading && !error && (
          <table
            className="w-full border-collapse rounded-xl overflow-hidden shadow"
            style={{ background: isDark ? "#1e293b" : "#fff" }}
          >
            <thead>
              <tr style={{ background: isDark ? "#334155" : "#e2e8f0" }}>
                <th className="py-3 px-2 text-left">#</th>
                <th className="py-3 px-2 text-left">Player</th>
                <th className="py-3 px-2 text-left">Current Streak</th>
                <th className="py-3 px-2 text-left">Longest Streak</th>
                <th className="py-3 px-2 text-left">Games Played</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => {
                let avatarUrl = user.avatar_url;
                if (user.avatar_file_id) {
                  avatarUrl = `${apiBaseUrl}/api/user/avatar/${user.avatar_file_id}`;
                } else if (avatarUrl && avatarUrl.startsWith("/user/avatar/")) {
                  avatarUrl = `${apiBaseUrl}/api${avatarUrl}`;
                }
                let rowStyle: React.CSSProperties = {};
                if (idx === 0) {
                  rowStyle.background = isDark
                    ? "linear-gradient(90deg, #2a2100 80%, #ffe066 100%)"
                    : "linear-gradient(90deg, #fffbe6 80%, #ffe066 100%)";
                } else if (idx === 1) {
                  rowStyle.background = isDark
                    ? "linear-gradient(90deg, #23272f 80%, #d1d5db 100%)"
                    : "linear-gradient(90deg, #f8fafc 80%, #d1d5db 100%)";
                } else if (idx === 2) {
                  rowStyle.background = isDark
                    ? "linear-gradient(90deg, #2a1f0e 80%, #eab308 100%)"
                    : "linear-gradient(90deg, #fff7ed 80%, #eab308 100%)";
                }
                return (
                  <tr
                    key={user.username}
                    className={`leaderboard-row border-b last:border-b-0`}
                    style={{ ...rowStyle, cursor: "pointer" }}
                  >
                    <td className="py-2 px-2 font-semibold">{idx + 1}</td>
                    <td className="py-2 px-2 flex items-center gap-3">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={user.username} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <div className="avatar" style={{width:32, height:32, borderRadius:"50%", background:'#ccc', display:'flex',alignItems:'center',justifyContent:'center'}}>{user.username.charAt(0).toUpperCase()}</div>
                      )}
                      <span>{user.username}</span>
                    </td>
                    <td className="py-2 px-2">{user.current_streak}</td>
                    <td className="py-2 px-2">{user.longest_streak}</td>
                    <td className="py-2 px-2">{user.games_played}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
