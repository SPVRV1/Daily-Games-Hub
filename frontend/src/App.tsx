import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Friends from "./pages/Friends";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ProfilePage from "./pages/profile/page";
import GamePage from "./components/game/GamePage";
import Wordle from "./components/game/Wordle";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route
                    path="/wordle"
                    element={
                        <GamePage
                        gameType="wordle"
                        renderGame={(challenge, onFinish) => (
                            <Wordle data={challenge} onFinish={onFinish} />
                        )}
                        />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;