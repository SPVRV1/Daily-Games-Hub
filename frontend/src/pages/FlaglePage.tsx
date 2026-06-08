import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import GamePage from "../components/game/GamePage";
import Flagle from "../components/game/Flagle";
import GameEndScreen from "../components/game/GameEndScreen";
import { GameChallenge, GameResult } from "../types/game.types";
import "./FlaglePage.css";

const API = import.meta.env.VITE_API_URL ?? "";
const MAX_DAYS_BACK = 3;

function formatDate(d: Date): string {
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth()).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}-${month}-${year}`;
}

function dateLabel(daysBack: number): string {
    if (daysBack === 0) return "Today";
    if (daysBack === 1) return "Yesterday";
    return `${daysBack} days ago`;
}

function dateForOffset(daysBack: number): string {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - daysBack);
    return formatDate(d);
}

export default function FlaglePage() {
    const [daysBack, setDaysBack] = useState(0);
    const [archiveChallenge, setArchiveChallenge] = useState<GameChallenge | null>(null);
    const [archiveLoading, setArchiveLoading] = useState(false);
    const [archiveError, setArchiveError] = useState(false);
    const [archiveFinished, setArchiveFinished] = useState(false);
    const [archiveResult, setArchiveResult] = useState<GameResult | null>(null);

    const fetchArchive = (offset: number) => {
        setArchiveLoading(true);
        setArchiveError(false);
        setArchiveFinished(false);
        setArchiveResult(null);
        setArchiveChallenge(null);
        fetch(`${API}/api/games/flagle/date/${dateForOffset(offset)}`)
            .then((r) => r.json())
            .then((data) => { setArchiveChallenge(data); setArchiveLoading(false); })
            .catch(() => { setArchiveError(true); setArchiveLoading(false); });
    };

    useEffect(() => {
        if (daysBack !== 0) fetchArchive(daysBack);
    }, [daysBack]);

    const nav = (
        <div className="flagle-day-nav">
            <button
                className="day-arrow"
                disabled={daysBack >= MAX_DAYS_BACK}
                onClick={() => setDaysBack((d) => d + 1)}
                aria-label="Previous day"
            >
                &#8592;
            </button>
            <span className="day-label">{dateLabel(daysBack)}</span>
            <button
                className="day-arrow"
                disabled={daysBack === 0}
                onClick={() => setDaysBack((d) => d - 1)}
                aria-label="Next day"
            >
                &#8594;
            </button>
        </div>
    );

    if (daysBack === 0) {
        return (
            <>
                <Navbar activeLink="home" />
                {nav}
                <GamePage
                    gameType="flagle"
                    renderGame={(challenge, onFinish) => (
                        <Flagle data={challenge} onFinish={onFinish} hideNavbar />
                    )}
                />
            </>
        );
    }

    return (
        <>
            <Navbar activeLink="home" />
            {nav}
            <div className="practice-banner">Practice mode — results won't be saved</div>
            {archiveLoading && <div className="archive-loading">Loading...</div>}
            {archiveError && <div className="archive-loading">Challenge not available for this date.</div>}
            {!archiveLoading && !archiveError && archiveChallenge && !archiveFinished && (
                <Flagle
                    data={archiveChallenge}
                    onFinish={(r) => { setArchiveResult(r); setArchiveFinished(true); }}
                    hideNavbar
                />
            )}
            {archiveFinished && archiveResult && (
                <GameEndScreen
                    result={archiveResult}
                    onPlayAgain={() => fetchArchive(daysBack)}
                />
            )}
        </>
    );
}
