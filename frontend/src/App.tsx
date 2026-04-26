import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ProfilePage from "./pages/profile/page";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;