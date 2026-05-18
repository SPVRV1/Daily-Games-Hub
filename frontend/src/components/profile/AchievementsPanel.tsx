import { useTheme } from "../../context/ThemeContext";
import { Flag, Trophy } from "lucide-react";

type Achievement = {
    title: string;
    description?: string;
    unlockedAt?: string | Date | { $date?: string } | null;
};

type AchievementsPanelProps = {
    achievements?: Achievement[];
};

export default function AchievementsPanel({ achievements = [] }: AchievementsPanelProps) {
    const { isDark } = useTheme();
    const items = achievements.filter((achievement) => achievement.title);
    const hasAchievements = items.length > 0;

    return (
        <aside className={`rounded-2xl border p-5 shadow-sm transition-colors xl:h-fit ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-linear-to-br from-white to-violet-50/20"}`}>
            <h2 className={`text-[22px] font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>Achievements</h2>

            <div className="mt-4 space-y-3">
                {hasAchievements ? (
                    items.map((achievement) => {
                        const unlockedAt = typeof achievement.unlockedAt === "object" && achievement.unlockedAt && "$date" in achievement.unlockedAt
                            ? achievement.unlockedAt.$date
                            : achievement.unlockedAt;
                        const isUnlocked = Boolean(unlockedAt);

                        return (
                            <article
                                key={achievement.title}
                                className={[
                                    "flex items-start justify-between gap-3 rounded-xl border px-3 py-3",
                                    isUnlocked
                                        ? (isDark ? "border-amber-500/40 bg-amber-500/10" : "border-amber-300 bg-amber-50")
                                        : (isDark ? "border-slate-700 bg-slate-800/70 opacity-65" : "border-slate-200 bg-slate-50/70 opacity-65"),
                                ].join(" ")}
                            >
                                <div className="flex min-w-0 gap-2">
                                    <span className={`pt-0.5 ${isDark ? "text-slate-200" : "text-violet-700"}`} aria-hidden="true">
                                        {isUnlocked ? <Trophy size={16} strokeWidth={2} /> : <Flag size={16} strokeWidth={2} />}
                                    </span>
                                    <div className="min-w-0">
                                        <p className={`truncate text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{achievement.title}</p>
                                        <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                            {achievement.description ?? "Achievement unlocked"}
                                        </p>
                                    </div>
                                </div>
                                {isUnlocked && (
                                    <span className={`${isDark ? "text-amber-300" : "text-amber-600"}`} aria-hidden="true">
                                        <Trophy size={16} strokeWidth={2} />
                                    </span>
                                )}
                            </article>
                        );
                    })
                ) : (
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        No achievements unlocked yet.
                    </p>
                )}
            </div>
        </aside>
    );
}
