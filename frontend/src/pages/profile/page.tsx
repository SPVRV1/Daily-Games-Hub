import Navbar from "../../components/Navbar";
import ProfileHero from "../../components/profile/ProfileHero";
import OverviewSection from "../../components/profile/OverviewSection";
import WeeklyActivity from "../../components/profile/WeeklyActivity";
import GameStatistics from "../../components/profile/GameStatistics";
import AchievementsPanel from "../../components/profile/AchievementsPanel";
import ProfileEditForm from "../../components/profile/ProfileEditForm";
import { useTheme } from "../../context/ThemeContext";
import { useEffect, useMemo, useState } from "react";

type Achievement = {
    title: string;
    description?: string;
    unlockedAt?: string | Date | { $date?: string } | null;
};

type StatisticsGame = {
    title: string;
    averageAttempts: number;
    averageTime: number;
    gamesPlayed: number;
};

type StatisticsData = {
    week: number[];
    games: StatisticsGame[];
    achievements: Achievement[];
};

type UserProfile = {
    _id: number;
    username: string;
    email?: string;
    avatar_url?: string;
    current_streak: number;
    longest_streak?: number;
    games_played: number;
    num_achievements: number;
    global_rank: number;
    created_at: string | Date | { $date?: string };
    achievements?: Achievement[];
};

const formatMonthYear = (value?: string | Date | { $date?: string } | null) => {
    if (!value) {
        return "";
    }

    const rawDateValue = typeof value === "object" && !(value instanceof Date) && "$date" in value
        ? value.$date
        : value;

    const date = rawDateValue instanceof Date ? rawDateValue : new Date(rawDateValue as string);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
};

const ProfilePage = () => {
    const { isDark } = useTheme();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [statistics, setStatistics] = useState<StatisticsData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        username: "",
        email: "",
        avatar_url: "",
    });
    const apiBaseUrl = useMemo(() => {
        const envPort = import.meta.env.VITE_API_PORT;
        if (envPort) {
            return `http://localhost:${envPort}`;
        }
        return import.meta.env.VITE_API_URL ?? "http://localhost:3000";
    }, []);
    const userId = 1 as const;

    useEffect(() => {
        if (!user || isEditing) {
            return;
        }

        setEditForm({
            username: user.username ?? "",
            email: user.email ?? "",
            avatar_url: user.avatar_url ?? "",
        });
    }, [user, isEditing]);

    useEffect(() => {
        const controller = new AbortController();

        const loadUser = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("Not authenticated. Please log in.");
                }

                const authHeaders = {
                    Authorization: `Bearer ${token}`,
                };

                const response = await fetch(`${apiBaseUrl}/api/user/data?id=${userId}`, {
                    headers: {
                        ...authHeaders,
                    },
                    signal: controller.signal,
                });

                const payload = await response.json();

                if (!response.ok || !payload?.ok) {
                    throw new Error(payload?.error || "Failed to load profile");
                }

                setUser(payload.user as UserProfile);

                const statisticsResponse = await fetch(`${apiBaseUrl}/api/user/data/statistics?id=${userId}`, {
                    headers: {
                        ...authHeaders,
                    },
                    signal: controller.signal,
                });
                const statisticsPayload = await statisticsResponse.json();

                if (
                    !statisticsResponse.ok ||
                    !statisticsPayload?.ok ||
                    !statisticsPayload?.data
                ) {
                    throw new Error(statisticsPayload?.error || "Failed to load statistics");
                }

                const statsData = statisticsPayload.data as Partial<StatisticsData>;
                setStatistics({
                    week: Array.isArray(statsData.week) ? statsData.week : [],
                    games: Array.isArray(statsData.games) ? statsData.games as StatisticsGame[] : [],
                    achievements: Array.isArray(statsData.achievements) ? statsData.achievements as Achievement[] : [],
                });
            } catch (loadError) {
                if (loadError instanceof DOMException && loadError.name === "AbortError") {
                    return;
                }

                setError(loadError instanceof Error ? loadError.message : "Failed to load profile");
                setUser(null);
                setStatistics(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();

        return () => controller.abort();
    }, [apiBaseUrl]);

    const memberSince = user ? formatMonthYear(user.created_at) : "";
    const initial = user?.username?.charAt(0).toUpperCase() ?? "?";

    const handleToggleEdit = () => {
        setSaveError(null);
        setSaveSuccess(null);

        setIsEditing((prev) => {
            const next = !prev;
            if (!next && user) {
                setEditForm({
                    username: user.username ?? "",
                    email: user.email ?? "",
                    avatar_url: user.avatar_url ?? "",
                });
            }
            return next;
        });
    };

    const handleSaveProfile = async () => {
        if (!user) {
            setSaveError("Profile data is not loaded yet.");
            return;
        }

        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(null);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Not authenticated. Please log in.");
            }

            const payload: Record<string, unknown> = {
                id: userId,
            };

            if (editForm.username !== user.username) {
                payload.username = editForm.username;
            }

            if ((editForm.email || "") !== (user.email || "")) {
                payload.email = editForm.email;
            }

            if ((editForm.avatar_url || "") !== (user.avatar_url || "")) {
                payload.avatar_url = editForm.avatar_url;
            }

            if (Object.keys(payload).length === 1) {
                setSaveError("No changes to save.");
                return;
            }

            const response = await fetch(`${apiBaseUrl}/api/user/data/edit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const responsePayload = await response.json().catch(() => null);

            if (!response.ok || !responsePayload?.ok) {
                throw new Error(responsePayload?.error || "Failed to update profile");
            }

            setUser((prevUser) => (prevUser ? {
                ...prevUser,
                username: payload.username !== undefined ? String(payload.username) : prevUser.username,
                email: payload.email !== undefined ? String(payload.email) : prevUser.email,
                avatar_url: payload.avatar_url !== undefined ? String(payload.avatar_url) : prevUser.avatar_url,
            } : prevUser));

            setIsEditing(false);
            setSaveSuccess("Profile updated successfully.");
        } catch (saveErr) {
            setSaveError(saveErr instanceof Error ? saveErr.message : "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={`min-h-screen transition-colors ${isDark ? "bg-slate-950" : "bg-slate-100"} flex flex-col`}>
            <Navbar activeLink="none" />

            <div className="relative flex-1">
                <main className="mx-auto w-full max-w-350 px-4 py-6 sm:px-6 lg:px-8">
                    <div className="space-y-5">
                        <ProfileHero
                            name={user?.username ?? (isLoading ? "Loading..." : "Unknown user")}
                            memberSince={memberSince || "-"}
                            initial={initial}
                            onEditProfile={handleToggleEdit}
                            editLabel={isEditing ? "Cancel" : "Edit Profile"}
                            editDisabled={isLoading || isSaving}
                        />

                        {isEditing && (
                            <ProfileEditForm
                                values={editForm}
                                onChange={setEditForm}
                                onSave={() => void handleSaveProfile()}
                                onCancel={handleToggleEdit}
                                isSaving={isSaving}
                                error={saveError}
                                success={saveSuccess}
                            />
                        )}

                        {error && (
                            <div className={`rounded-2xl border px-4 py-3 text-sm ${isDark ? "border-slate-800 bg-slate-900 text-slate-200" : "border-slate-200 bg-white text-slate-700"}`}>
                                <p>Could not load profile: {error}</p>
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
                                <WeeklyActivity week={statistics?.week} />
                                <GameStatistics games={statistics?.games} />
                            </div>
                            <div className="min-w-0">
                                <AchievementsPanel achievements={statistics?.achievements ?? user?.achievements ?? []} />
                            </div>
                        </div>
                    </div>
                </main>

                {isLoading && (
                    <div
                        className={`absolute inset-0 z-10 flex items-center justify-center px-4 backdrop-blur-sm ${isDark ? "bg-slate-950/40" : "bg-white/50"}`}
                        aria-live="polite"
                        aria-busy="true"
                    >
                        <div className={`rounded-2xl border px-5 py-3 text-sm font-semibold shadow-sm ${isDark ? "border-slate-800 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900"}`}>
                            Loading profile...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
