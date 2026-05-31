import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Friends from "./pages/Friends";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ProfilePage from "./pages/profile/page";
import FlaglePage from "./pages/FlaglePage";
import MathSprint from "./pages/MathSprint";
import WordlePage from "./pages/WordlePage";
import WorldlePage from "./pages/WorldlePage";
import { UserContext } from "./context/UserContext";

function App() {
  const [user, setUser] = useState<{ username: string; avatarUrl?: string } | null>(null);
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
