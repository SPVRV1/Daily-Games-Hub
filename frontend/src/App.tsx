import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import Home from "./pages/Home";
import Friends from "./pages/Friends";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ProfilePage from "./pages/ProfilePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import FlaglePage from "./pages/FlaglePage";
import MathSprint from "./pages/MathSprint";
import WordlePage from "./pages/WordlePage";
import WorldlePage from "./pages/WorldlePage";
import { UserContext } from "./context/UserContext";

function App() {
  const [user, setUser] = useState<{ username: string; avatarUrl?: string } | null>(null);
  const apiBaseUrl = useMemo(() => {
    const envPort = import.meta.env.VITE_API_PORT;
    if (envPort) {
      return `http://localhost:${envPort}`;
    }
    return import.meta.env.VITE_API_URL ?? "http://localhost:3000";
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/user/data`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.ok) {
          setUser(null);
          return;
        }

        const userData = payload.user as { username?: string; avatar_url?: string; avatar_file_id?: string };
        let avatarUrl: string | undefined = undefined;
        if (userData?.avatar_file_id) {
          avatarUrl = `${apiBaseUrl}/api/user/avatar/${userData.avatar_file_id}`;
        } else if (userData?.avatar_url) {
          const fileIdMatch = userData.avatar_url.match(/\/user\/avatar\/([a-f\d]{24})$/);
          if (fileIdMatch) {
            avatarUrl = `${apiBaseUrl}/api/user/avatar/${fileIdMatch[1]}`;
          } else if (/^https?:\/\//.test(userData.avatar_url)) {
            avatarUrl = userData.avatar_url;
          } else if (userData.avatar_url.startsWith("/user/avatar/")) {
            avatarUrl = `${apiBaseUrl}/api${userData.avatar_url}`;
          } else if (userData.avatar_url.startsWith("/api/")) {
            avatarUrl = `${apiBaseUrl}${userData.avatar_url}`;
          }
        }

        if (userData?.username) {
          setUser({
            username: userData.username,
            avatarUrl,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setUser(null);
      }
    };

    loadUser();

    return () => controller.abort();
  }, [apiBaseUrl]);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/flagle" element={<FlaglePage />} />
          <Route path="/math-sprint" element={<MathSprint />} />
          <Route path="/wordle" element={<WordlePage />} />
          <Route path="/worldle" element={<WorldlePage />} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
