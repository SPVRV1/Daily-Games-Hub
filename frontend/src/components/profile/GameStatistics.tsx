import { useTheme } from "../../context/ThemeContext";

type GameStat = {
	title: string;
	averageAttempts: number;
	averageTime: number;
	gamesPlayed: number;
};

const DEFAULT_GAME_STATS: GameStat[] = [
	{ title: "Wordle", averageAttempts: 0.0, averageTime: 0.0, gamesPlayed: 0.0 },
	{ title: "Flagle", averageAttempts: 0.0, averageTime: 0.0, gamesPlayed: 0.0 },
	{ title: "Math Sprint", averageAttempts: 0.0, averageTime: 0.0, gamesPlayed: 0.0 },
	{ title: "Worldle", averageAttempts: 0.0, averageTime: 0.0, gamesPlayed: 0.0 },
];

type GameStatisticsProps = {
	games?: GameStat[];
};

export default function GameStatistics({ games }: GameStatisticsProps) {
	const { isDark } = useTheme();
	const stats = games && games.length > 0 ? games : DEFAULT_GAME_STATS;

	const shouldShowAvgTime = (title: string) => {
		const normalized = title.trim().toLowerCase();
		return normalized === "math sprint";
	};

	return (
		<section className={`rounded-2xl border p-5 shadow-sm transition-colors ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-linear-to-br from-white to-emerald-50/20"}`}>
			<h2 className={`text-[22px] font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
				Game Statistics
			</h2>

			<div className="mt-4">
				{stats.map((stat, index) => (
					<article
						key={stat.title}
						className={[
							"grid items-center gap-3 py-4 transition-colors sm:grid-cols-[minmax(0,1fr)_auto]",
							isDark ? "hover:bg-slate-800/40" : "hover:bg-emerald-50/40",
							index !== stats.length - 1 ? (isDark ? "border-b border-slate-800" : "border-b border-slate-200") : "",
						].join(" ")}
					>
						<div className="min-w-0">
							<p className={`text-2xl font-semibold leading-tight ${isDark ? "text-slate-100" : "text-slate-800"}`}>
								{stat.title}
							</p>
							<p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
								Avg attempts: <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>{stat.averageAttempts.toFixed(1)}</span>
								{shouldShowAvgTime(stat.title) && (
									<>
										<span className="mx-2"> </span>
										Avg time: <span className="font-semibold text-emerald-500">{Math.round(stat.averageTime)}s</span>
									</>
								)}
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
