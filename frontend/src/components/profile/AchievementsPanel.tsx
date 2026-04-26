import { useTheme } from "../../context/ThemeContext";
import { Bolt, CalendarDays, Flag, Flame, Gamepad2, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Achievement = {
    title: string;
    description: string;
    Icon: LucideIcon;
    unlocked: boolean;
};

const ACHIEVEMENTS: Achievement[] = [
    { title: "First Steps", description: "Complete your first game", Icon: Flag, unlocked: true },
    { title: "Week Warrior", description: "Maintain a 7-day streak", Icon: Flame, unlocked: true },
    { title: "Perfectionist", description: "Complete a game with perfect score", Icon: Trophy, unlocked: true },
    { title: "Monthly Master", description: "Maintain a 30-day streak", Icon: CalendarDays, unlocked: false },
    { title: "Jack of All Games", description: "Play all available games in one day", Icon: Gamepad2, unlocked: false },
    { title: "Speed Demon", description: "Complete Math Sprint in under 30 seconds", Icon: Bolt, unlocked: false },
];

export default function AchievementsPanel() {
    const { isDark } = useTheme();

    return (
        <aside className={`rounded-2xl border p-5 shadow-sm transition-colors xl:h-fit ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-linear-to-br from-white to-violet-50/20"}`}>
            <h2 className={`text-[22px] font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>Achievements</h2>

            <div className="mt-4 space-y-3">
                {ACHIEVEMENTS.map((achievement) => (
                    <article
                        key={achievement.title}
                        className={[
                            "flex items-start justify-between gap-3 rounded-xl border px-3 py-3",
                            achievement.unlocked
                                ? (isDark ? "border-amber-500/40 bg-amber-500/10" : "border-amber-300 bg-amber-50")
                                : (isDark ? "border-slate-700 bg-slate-800/70 opacity-65" : "border-slate-200 bg-slate-50/70 opacity-65"),
                        ].join(" ")}
                    >
                        <div className="flex min-w-0 gap-2">
                            <span className={`pt-0.5 ${isDark ? "text-slate-200" : "text-violet-700"}`} aria-hidden="true">
                                <achievement.Icon size={16} strokeWidth={2} />
                            </span>
                            <div className="min-w-0">
                                <p className={`truncate text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{achievement.title}</p>
                                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{achievement.description}</p>
                            </div>
                        </div>
                        {achievement.unlocked && (
                            <span className={`${isDark ? "text-amber-300" : "text-amber-600"}`} aria-hidden="true">
                                <Trophy size={16} strokeWidth={2} />
                            </span>
                        )}
                    </article>
                ))}
            </div>
        </aside>
    );
}