import { useTheme } from "../../context/ThemeContext";
import { CalendarDays } from "lucide-react";

type DayActivity = {
    day: string;
    level: number;
};

const ACTIVITY: DayActivity[] = [
    { day: "Mon", level: 5 },
    { day: "Tue", level: 1 },
    { day: "Wed", level: 7 },
    { day: "Thu", level: 3 },
    { day: "Fri", level: 5 },
    { day: "Sat", level: 7 },
    { day: "Sun", level: 1 },
];

export default function WeeklyActivity() {
    const { isDark } = useTheme();

    return (
        <section className={`rounded-2xl border p-5 shadow-sm transition-colors ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-linear-to-br from-white to-amber-50/25"}`}>
            <h2 className={`flex items-center gap-2 text-[22px] font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                <CalendarDays size={20} strokeWidth={2} className={isDark ? "text-slate-200" : "text-amber-600"} />
                This Week's Activity
            </h2>

            <div className="mt-4 grid h-56 grid-cols-7 gap-1.5 sm:gap-2">
                {ACTIVITY.map((item) => (
                    <div key={item.day} className="flex flex-col">
                        <div className={`flex flex-1 items-end rounded-xl p-0.5 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                            <div
                                className="w-full rounded-[10px] bg-linear-to-b from-orange-400 via-amber-400 to-yellow-300"
                                style={{ height: `${Math.max(0, Math.min(7, item.level)) * (100 / 7)}%` }}
                            />
                        </div>
                        <span className={`mt-2 text-center text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{item.day}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}