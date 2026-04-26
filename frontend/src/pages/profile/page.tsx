import { useState } from "react";
import Navbar from "../../components/Navbar";

const ProfilePage = () => {
    const [dark, setDark] = useState(false);

    return (
        <div className={`home${dark ? " dark" : ""}`}>
            <Navbar dark={dark} onToggleTheme={() => setDark(!dark)} activeLink="home" />

            <main className="content">
                <div className="welcome">
                    <h1>Profile</h1>
                    <p>This is the profile page.</p>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;