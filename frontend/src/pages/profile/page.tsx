import Navbar from "../../components/Navbar";
import ProfileHero from "../../components/profile/ProfileHero";
import OverviewSection from "../../components/profile/OverviewSection";
import WeeklyActivity from "../../components/profile/WeeklyActivity";
import GameStatistics from "../../components/profile/GameStatistics";
import AchievementsPanel from "../../components/profile/AchievementsPanel";
import { useTheme } from "../../context/ThemeContext";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

type Achievement = {
    title: string;
    description?: string;
    unlockedAt?: string | Date | null;
};

type UserProfile = {
    _id: number;
    username: string;
    avatar_url?: string;
    current_streak: number;
    games_played: number;
    num_achievements: number;
    global_rank: number;
    created_at: string | Date;
    achievements?: Achievement[];
};

const formatMonthYear = (value?: string | Date) => {
    if (!value) {
        return "";
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
};

const ProfilePage = () => {
    const { isDark } = useTheme();
    const [searchParams] = useSearchParams();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const userId = useMemo(() => {
        const idParam = searchParams.get("id") ?? "1";
        const parsed = Number(idParam);
        return Number.isNaN(parsed) ? 1 : parsed;
    }, [searchParams]);

    useEffect(() => {
        const controller = new AbortController();

        const loadUser = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(`/api/user/data?id=${userId}`, {
                    signal: controller.signal,
                });

                const payload = await response.json();

                if (!response.ok || !payload?.ok) {
                    throw new Error(payload?.error || "Failed to load profile");
                }

                setUser(payload.user as UserProfile);
            } catch (loadError) {
                if (loadError instanceof DOMException && loadError.name === "AbortError") {
                    return;
                }

                setError(loadError instanceof Error ? loadError.message : "Failed to load profile");
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();

        return () => controller.abort();
    }, [userId]);

    const memberSince = user ? formatMonthYear(user.created_at) : "";
    const initial = user?.username?.charAt(0).toUpperCase() ?? "?";

    return (
        <div className={`min-h-screen transition-colors ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
            <Navbar activeLink="none" />

            <main className="mx-auto w-full max-w-350 px-4 py-6 sm:px-6 lg:px-8">
                <div className="space-y-5">
                    <ProfileHero
                        name={user?.username ?? (isLoading ? "Loading..." : "Unknown user")}
                        memberSince={memberSince || "-"}
                        initial={initial}
                    />

                    {(isLoading || error) && (
                        <div className={`rounded-2xl border px-4 py-3 text-sm ${isDark ? "border-slate-800 bg-slate-900 text-slate-200" : "border-slate-200 bg-white text-slate-700"}`}>
                            {isLoading && <p>Loading profile...</p>}
                            {error && <p>Could not load profile: {error}</p>}
                        </div>
                    )}

                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                        <div className="space-y-4 min-w-0">
                            <OverviewSection
                                currentStreak={user?.current_streak ?? null}
                                gamesPlayed={user?.games_played ?? null}
                                achievementsCount={user?.num_achievements ?? null}
                                globalRank={user?.global_rank ?? null}
                            />
                            <WeeklyActivity />
                            <GameStatistics />
                        </div>
                        <div className="min-w-0">
                            <AchievementsPanel achievements={user?.achievements ?? []} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;