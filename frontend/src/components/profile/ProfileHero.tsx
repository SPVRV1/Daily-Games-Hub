import { useTheme } from "../../context/ThemeContext";

type ProfileHeroProps = {
    name: string;
    memberSince: string;
    initial: string;
};

export default function ProfileHero({ name, memberSince, initial }: ProfileHeroProps) {
    const { isDark } = useTheme();

    return (
        <section className={`rounded-2xl border p-5 shadow-sm transition-colors ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
            <div className="h-28 rounded-xl bg-linear-to-r from-blue-600 via-blue-400 to-cyan-400 sm:h-32" />

            <div className="-mt-8 flex flex-wrap items-end justify-between gap-4 px-2 sm:-mt-9">
                <div>
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border-4 bg-blue-600 text-3xl font-semibold text-white shadow-sm ${isDark ? "border-slate-900" : "border-white"}`}>
                        {initial}
                    </div>
                    <h1 className={`mt-2 text-3xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>{name}</h1>
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Member since {memberSince}</p>
                </div>

                <button
                    type="button"
                    className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    Edit Profile
                </button>
            </div>
        </section>
    );
}