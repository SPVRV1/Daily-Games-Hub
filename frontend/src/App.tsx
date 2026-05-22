import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Friends from "./pages/Friends";
import Statistics from "./pages/statistics/Statistics";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ProfilePage from "./pages/profile/page";
import FlaglePage from "./pages/FlaglePage";
import MathSprint from "./pages/MathSprint";
import WordlePage from "./pages/WordlePage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/flagle" element={<FlaglePage />} />
        <Route path="/math-sprint" element={<MathSprint />} />
        <Route path="/wordle" element={<WordlePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
