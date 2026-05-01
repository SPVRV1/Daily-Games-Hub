import { useTheme } from "../../context/ThemeContext";
import { BadgeCheck, Flame, Gamepad2, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type StatItem = {
    label: string;
    value: string;
    Icon: LucideIcon;
    lightBackgroundClass: string;
    darkBackgroundClass: string;
    iconClass: string;
};

type OverviewSectionProps = {
    currentStreak?: number | null;
    gamesPlayed?: number | null;
    achievementsCount?: number | null;
    globalRank?: number | null;
};

function StatCard({ label, value, Icon, lightBackgroundClass, darkBackgroundClass, iconClass, isDark }: StatItem & { isDark: boolean }) {
    return (
        <article className={`${isDark ? darkBackgroundClass : lightBackgroundClass} rounded-xl border p-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-sm ${isDark ? "border-slate-700/80" : "border-slate-100"}`}>
            <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "bg-slate-700/80 text-slate-100" : `bg-white/80 ${iconClass}`}`}>
                <Icon size={18} strokeWidth={2} />
            </div>
            <div className={`mt-2 text-4xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>{value}</div>
            <div className={`mt-1 text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</div>
        </article>
    );
}

const toStatValue = (value: number | null | undefined, formatter?: (value: number) => string) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return "-";
    }

    return formatter ? formatter(value) : String(value);
};

export default function OverviewSection({ currentStreak, gamesPlayed, achievementsCount, globalRank }: OverviewSectionProps) {
    const { isDark } = useTheme();
    const stats: StatItem[] = [
        {
            label: "Day Streak",
            value: toStatValue(currentStreak),
            Icon: Flame,
            lightBackgroundClass: "bg-amber-50",
            darkBackgroundClass: "bg-amber-500/8",
            iconClass: "text-amber-600",
        },
        {
            label: "Games Played",
            value: toStatValue(gamesPlayed),
            Icon: Gamepad2,
            lightBackgroundClass: "bg-sky-50",
            darkBackgroundClass: "bg-sky-500/8",
            iconClass: "text-sky-600",
        },
        {
            label: "Achievements",
            value: toStatValue(achievementsCount),
            Icon: Trophy,
            lightBackgroundClass: "bg-emerald-50",
            darkBackgroundClass: "bg-emerald-500/8",
            iconClass: "text-emerald-600",
        },
        {
            label: "Global Rank",
            value: toStatValue(globalRank, (value) => `#${value}`),
            Icon: BadgeCheck,
            lightBackgroundClass: "bg-violet-50",
            darkBackgroundClass: "bg-violet-500/8",
            iconClass: "text-violet-600",
        },
    ];

    return (
        <section className={`rounded-2xl border p-5 shadow-sm transition-colors ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-linear-to-br from-white to-sky-50/30"}`}>
            <h2 className={`flex items-center gap-2 text-[22px] font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                <BadgeCheck size={20} strokeWidth={2} className={isDark ? "text-slate-200" : "text-sky-600"} />
                Overview
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} isDark={isDark} />
                ))}
            </div>
        </section>
    );
}