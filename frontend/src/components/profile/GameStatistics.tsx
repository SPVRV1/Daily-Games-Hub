import { useTheme } from "../../context/ThemeContext";

type GameStat = {
	game: string;
	averageLabel: string;
	averageValue: string;
	bestValue: string;
	gamesPlayed: number;
};

const GAME_STATS: GameStat[] = [
	{ game: "Wordle", averageLabel: "Avg attempts", averageValue: "4.2", bestValue: "2", gamesPlayed: 42 },
	{ game: "Flagle", averageLabel: "Avg attempts", averageValue: "3.1", bestValue: "1", gamesPlayed: 38 },
	{ game: "Math Sprint", averageLabel: "Avg time", averageValue: "52s", bestValue: "38s", gamesPlayed: 45 },
	{ game: "Worldle", averageLabel: "Avg attempts", averageValue: "4.5", bestValue: "2", gamesPlayed: 35 },
];

export default function GameStatistics() {
	const { isDark } = useTheme();

	return (
		<section className={`rounded-2xl border p-5 shadow-sm transition-colors ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-linear-to-br from-white to-emerald-50/20"}`}>
			<h2 className={`text-[22px] font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
				Game Statistics
			</h2>

			<div className="mt-4">
				{GAME_STATS.map((stat, index) => (
					<article
						key={stat.game}
						className={[
							"grid items-center gap-3 py-4 transition-colors sm:grid-cols-[minmax(0,1fr)_auto]",
							isDark ? "hover:bg-slate-800/40" : "hover:bg-emerald-50/40",
							index !== GAME_STATS.length - 1 ? (isDark ? "border-b border-slate-800" : "border-b border-slate-200") : "",
						].join(" ")}
					>
						<div className="min-w-0">
							<p className={`text-2xl font-semibold leading-tight ${isDark ? "text-slate-100" : "text-slate-800"}`}>
								{stat.game}
							</p>
							<p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
								{stat.averageLabel}: <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>{stat.averageValue}</span>
								<span className="mx-2"> </span>
								Best: <span className="font-semibold text-emerald-500">{stat.bestValue}</span>
							</p>
						</div>

						<p className={`justify-self-start text-sm sm:justify-self-end ${isDark ? "text-slate-400" : "text-slate-500"}`}>
							{stat.gamesPlayed} games played
						</p>
					</article>
				))}
			</div>
		</section>
	);
}
