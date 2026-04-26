import Navbar from "../../components/Navbar";
import ProfileHero from "../../components/profile/ProfileHero";
import OverviewSection from "../../components/profile/OverviewSection";
import WeeklyActivity from "../../components/profile/WeeklyActivity";
import GameStatistics from "../../components/profile/GameStatistics";
import AchievementsPanel from "../../components/profile/AchievementsPanel";
import { useTheme } from "../../context/ThemeContext";

const ProfilePage = () => {
    const { isDark } = useTheme();

    return (
        <div className={`min-h-screen transition-colors ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
            <Navbar activeLink="home" />

            <main className="mx-auto w-full max-w-350 px-4 py-6 sm:px-6 lg:px-8">
                <div className="space-y-5">
                    <ProfileHero name="Zlahtic" memberSince="April 2026" initial="Z" />

                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                        <div className="space-y-4 min-w-0">
                            <OverviewSection />
                            <WeeklyActivity />
                            <GameStatistics />
                        </div>
                        <div className="min-w-0">
                            <AchievementsPanel />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;