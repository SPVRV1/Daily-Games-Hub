import { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import { GameChallenge, GameResult } from "../types/game.types";
import "./SonglessPage.css";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const SNIPPET_DURATIONS = [1, 2, 4, 7, 11, 16];
const TOTAL_DURATION = SNIPPET_DURATIONS.reduce((a, b) => a + b, 0); // 41

interface SongChallengeData {
    challengeId: string;
    previewUrl: string;
    title: string;
    artist: string;
    allSongs: { title: string; artist: string }[];
}

type GuessState =
    | { type: "empty" }
    | { type: "wrong"; title: string }
    | { type: "skipped" }
    | { type: "correct"; title: string };

interface SonglessProps {
    data: GameChallenge;
    onFinish: (result: GameResult) => void;
    hideNavbar?: boolean;
}

function Songless({ data, onFinish, hideNavbar = false }: SonglessProps) {
    const challenge = data.challengeData as unknown as SongChallengeData;

    const [attemptLevel, setAttemptLevel] = useState(0);
    const [guesses, setGuesses] = useState<GuessState[]>(
        Array.from({ length: 6 }, () => ({ type: "empty" }))
    );
    const [finished, setFinished] = useState(false);
    const [won, setWon] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playProgress, setPlayProgress] = useState(0); // 0..1 within current segment

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const rafRef = useRef<number | null>(null);
    const playStartRef = useRef<number>(0);

    // Build set of already-guessed titles to exclude from autocomplete
    const guessedTitles = new Set(
        guesses
            .filter((g): g is { type: "wrong"; title: string } => g.type === "wrong")
            .map((g) => g.title.toLowerCase())
    );

    const filteredSongs =
        searchValue.trim().length > 0
            ? challenge.allSongs.filter(
                  (s) =>
                      s.title.toLowerCase().includes(searchValue.toLowerCase()) &&
                      !guessedTitles.has(s.title.toLowerCase())
              )
            : [];

    const stopPlayback = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        if (stopTimerRef.current !== null) {
            clearTimeout(stopTimerRef.current);
            stopTimerRef.current = null;
        }
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        setIsPlaying(false);
        setPlayProgress(0);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPlayback();
        };
    }, [stopPlayback]);

    const handlePlay = () => {
        if (finished) return;
        if (isPlaying) {
            stopPlayback();
            return;
        }

        const audio = audioRef.current;
        if (!audio) return;

        audio.currentTime = 0;
        audio.play().catch(() => {});

        const duration = SNIPPET_DURATIONS[attemptLevel] * 1000;
        playStartRef.current = performance.now();

        const tick = () => {
            const elapsed = performance.now() - playStartRef.current;
            const progress = Math.min(elapsed / duration, 1);
            setPlayProgress(progress);
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            }
        };
        rafRef.current = requestAnimationFrame(tick);

        stopTimerRef.current = setTimeout(() => {
            stopPlayback();
        }, duration);

        setIsPlaying(true);
    };

    const advanceLevel = (newGuesses: GuessState[]) => {
        stopPlayback();
        const nextLevel = attemptLevel + 1;
        setGuesses(newGuesses);
        setAttemptLevel(nextLevel);
    };

    const handleGuess = (title: string) => {
        if (finished) return;
        const trimmed = title.trim();
        if (!trimmed) return;

        setSearchValue("");
        setShowDropdown(false);

        const isCorrect =
            trimmed.toLowerCase() === challenge.title.toLowerCase();

        const newGuesses = [...guesses];
        newGuesses[attemptLevel] = isCorrect
            ? { type: "correct", title: trimmed }
            : { type: "wrong", title: trimmed };

        if (isCorrect) {
            stopPlayback();
            setGuesses(newGuesses);
            setFinished(true);
            setWon(true);
            onFinish({
                challenge_id: challenge.challengeId,
                completed: true,
                score: Math.max(10, 100 - attemptLevel * 15),
                attempts_used: attemptLevel + 1,
                correct_answers: 1,
                time_seconds: 0,
            });
        } else {
            const nextLevel = attemptLevel + 1;
            if (nextLevel >= 6) {
                stopPlayback();
                setGuesses(newGuesses);
                setAttemptLevel(6);
                setFinished(true);
                setWon(false);
                onFinish({
                    challenge_id: challenge.challengeId,
                    completed: false,
                    score: 0,
                    attempts_used: 6,
                    correct_answers: 0,
                    time_seconds: 0,
                });
            } else {
                advanceLevel(newGuesses);
            }
        }
    };

    const handleSkip = () => {
        if (finished) return;
        const newGuesses = [...guesses];
        newGuesses[attemptLevel] = { type: "skipped" };
        const nextLevel = attemptLevel + 1;
        if (nextLevel >= 6) {
            stopPlayback();
            setGuesses(newGuesses);
            setAttemptLevel(6);
            setFinished(true);
            setWon(false);
            onFinish({
                challenge_id: challenge.challengeId,
                completed: false,
                score: 0,
                attempts_used: 6,
                correct_answers: 0,
                time_seconds: 0,
            });
        } else {
            advanceLevel(newGuesses);
        }
    };

    // Compute cumulative offsets for the timeline segments
    const segmentWidths = SNIPPET_DURATIONS.map((d) => (d / TOTAL_DURATION) * 100);

    // Which segment is "active" (currently being played or reached)
    // Segments 0..attemptLevel-1 are completed/highlighted, attemptLevel is current
    const currentSegmentIndex = Math.min(attemptLevel, 5);

    return (
        <>
            {!hideNavbar && <Navbar activeLink="home" />}
            <audio
                ref={audioRef}
                src={`${API}${challenge.previewUrl}`}
                preload="auto"
            />
            <main className="songless-main">
                <div className="songless-title">
                    <h1>Songless</h1>
                    <p>Guess the song from a short snippet</p>
                </div>

                {/* Guess rows */}
                <div className="songless-guesses">
                    {guesses.map((g, i) => {
                        let className = "songless-guess-row";
                        let label = "";
                        if (g.type === "empty") {
                            className += " empty";
                        } else if (g.type === "wrong") {
                            className += " wrong";
                            label = g.title;
                        } else if (g.type === "skipped") {
                            className += " skipped";
                            label = "Skipped";
                        } else if (g.type === "correct") {
                            className += " correct";
                            label = g.title;
                        }
                        return (
                            <div key={i} className={className}>
                                <span>{label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Timeline bar */}
                <div className="songless-player">
                    <div className="songless-timeline" aria-label="Audio timeline">
                        {segmentWidths.map((w, i) => {
                            const isUnlocked = i <= currentSegmentIndex;
                            const isCurrent = i === currentSegmentIndex && !finished;
                            return (
                                <div
                                    key={i}
                                    className={`songless-segment ${isUnlocked ? "unlocked" : "locked"}`}
                                    style={{ width: `${w}%` }}
                                >
                                    {isCurrent && isPlaying && (
                                        <div
                                            className="songless-progress-indicator"
                                            style={{ width: `${playProgress * 100}%` }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="songless-duration-label">
                        {finished
                            ? `${SNIPPET_DURATIONS[Math.min(attemptLevel, 5)]}s`
                            : `${SNIPPET_DURATIONS[currentSegmentIndex]}s`}
                    </div>

                    {/* Play button */}
                    <button
                        className={`songless-play-btn ${isPlaying ? "playing" : ""}`}
                        onClick={handlePlay}
                        disabled={finished}
                        aria-label={isPlaying ? "Stop" : "Play snippet"}
                    >
                        {isPlaying ? "⏹" : "▶"}
                    </button>
                </div>

                {/* Search + Skip */}
                {!finished && (
                    <div className="songless-controls">
                        <div className="songless-search-wrapper">
                            <input
                                type="text"
                                className="songless-search"
                                placeholder="Search a song..."
                                value={searchValue}
                                onChange={(e) => {
                                    setSearchValue(e.target.value);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                                autoComplete="off"
                            />
                            {showDropdown && filteredSongs.length > 0 && (
                                <div className="songless-dropdown">
                                    {filteredSongs.slice(0, 8).map((s, i) => (
                                        <div
                                            key={i}
                                            className="songless-dropdown-item"
                                            onMouseDown={() => handleGuess(s.title)}
                                        >
                                            <span className="songless-dropdown-title">{s.title}</span>
                                            <span className="songless-dropdown-artist">{s.artist}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button className="songless-skip-btn" onClick={handleSkip}>
                            Skip &rarr;
                        </button>
                    </div>
                )}

                {/* Answer reveal when finished */}
                {finished && (
                    <div className="songless-answer">
                        <div className="songless-album-art-placeholder">
                            <span>♪</span>
                        </div>
                        <div className="songless-answer-info">
                            <p className="songless-answer-title">{challenge.title}</p>
                            <p className="songless-answer-artist">{challenge.artist}</p>
                        </div>
                        {won ? (
                            <p className="songless-result-msg won">You got it!</p>
                        ) : (
                            <p className="songless-result-msg lost">Better luck tomorrow!</p>
                        )}
                    </div>
                )}
            </main>
        </>
    );
}

// Static demo challenge — replace with GamePage when backend is seeded
const STATIC_CHALLENGE: GameChallenge = {
    gameType: "songless",
    date: "today",
    challengeData: {
        challengeId: "songless-demo",
        previewUrl: "", // no audio yet
        title: "Titanium",
        artist: "David Guetta ft. Sia",
        allSongs: [
            { title: "Titanium", artist: "David Guetta ft. Sia" },
            { title: "I Gotta Feeling", artist: "Black Eyed Peas" },
            { title: "Prada", artist: "Cassö, RAYE, D-Block Europe" },
            { title: "The Rhythm of the Night", artist: "Corona" },
            { title: "(It Goes Like) Nanana", artist: "Peggy Gou" },
            { title: "Moje sonce", artist: "Slovenian artist" },
            { title: "Gorenjska ljubljena", artist: "Slovenian artist" },
            { title: "Siva pot", artist: "Slovenian artist" },
            { title: "Soba 102", artist: "Slovenian artist" },
        ],
    } as unknown as Record<string, unknown>,
};

export default function SonglessPage() {
    return (
        <div className="songless-page">
            <Navbar activeLink="home" />
            <Songless
                data={STATIC_CHALLENGE}
                onFinish={() => {}}
                hideNavbar
            />
        </div>
    );
}
