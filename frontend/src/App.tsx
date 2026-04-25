import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Friends from "./pages/Friends";
 
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"        element={<Home />} />
                <Route path="/friends" element={<Friends />} />
            </Routes>
        </BrowserRouter>
    );
}
 
export default App;
 