import { Link } from "react-router-dom";
import { GameResult } from "../../types/game.types";
import "./GameEndScreen.css";

interface Props {
    result: GameResult;
    alreadyPlayed?: boolean;
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}:${String(s).padStart(2, "0")}`;
    return `${s}s`;
}

export default function GameEndScreen({ result, alreadyPlayed = false }: Props) {
    const won = result.completed;

    const stats: { icon: string; label: string; value: string; green?: boolean }[] = [];

    if (typeof result.score === "number" && result.score > 0) {
        stats.push({ icon: "fi-rr-star", label: "Score", value: String(result.score), green: won });
    }

    if (typeof result.attempts_used === "number" && result.attempts_used > 0) {
        stats.push({ icon: "fi-rr-redo", label: "Attempts used", value: String(result.attempts_used) });
    }

    if (typeof result.correct_answers === "number" && result.correct_answers > 0) {
        stats.push({ icon: "fi-rr-check", label: "Correct answers", value: String(result.correct_answers), green: true });
    }

    if (typeof result.time_seconds === "number" && result.time_seconds > 0) {
        stats.push({ icon: "fi-rr-clock", label: "Time", value: formatTime(result.time_seconds) });
    }

    return (
        <div className="game-end-page">
            <div className="game-end-card">
                {/* Icon */}
                <div className={`game-end-icon ${won ? "game-end-icon--win" : "game-end-icon--lose"}`}>
                    {won ? "🎉" : "😔"}
                </div>

                {/* Title */}
                <h2 className="game-end-title">
                    {won ? "Congratulations!" : "Better luck tomorrow!"}
                </h2>

                {/* Already played badge */}
                {alreadyPlayed && (
                    <p className="game-end-subtitle">
                        You already played today. Come back tomorrow for a new challenge!
                    </p>
                )}

                {/* Stats */}
                {stats.length > 0 && (
                    <div className="game-end-stats">
                        {stats.map((s) => (
                            <div className="game-end-stat" key={s.label}>
                                <span className="game-end-stat-label">
                                    <i className={`fi ${s.icon}`} />
                                    {s.label}
                                </span>
                                <span className={`game-end-stat-value${s.green ? " game-end-stat-value--green" : ""}`}>
                                    {s.value}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="game-end-actions">
                    <Link to="/" className="game-end-btn-primary">
                        <i className="fi fi-rr-home" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
