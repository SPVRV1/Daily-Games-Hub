import { useState, useEffect } from "react";
import Navbar from "../Navbar";
import "./Flagle.css";
import { GameChallenge, GameResult } from "../../types/game.types";
import { countryCoords, haversineDistance, bearing } from "../../data/countryCoords";

const MAX_ATTEMPTS = 6;

interface ChallengeData {
    challengeId: string;
    country: string;
    countryCode: string;
    flagUrl: string;
}

interface Country {
    name: string;
    code: string;
}

interface Attempt {
    guess: string;
    correct: boolean;
    distance: number | null;
    direction: string | null;
}

interface FlagleProps {
    data: GameChallenge;
    onFinish: (result: GameResult) => void;
    hideNavbar?: boolean;
}

export default function Flagle({ data, onFinish, hideNavbar = false }: FlagleProps) {
    const [guess, setGuess] = useState("");
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [finished, setFinished] = useState(false);
    const [revealed, setRevealed] = useState(0);
    const [countries, setCountries] = useState<Country[]>([]);

    const challenge = data.challengeData as unknown as ChallengeData;

    useEffect(() => {
        fetch("/api/countries")
            .then((r) => r.json())
            .then((list: Country[]) =>
                setCountries(list.filter((c) => c.code in countryCoords))
            )
            .catch(() => {});
    }, []);

    const filtered =
        guess.trim().length === 0
            ? []
            : countries.filter((c) =>
                  c.name.toLowerCase().includes(guess.toLowerCase())
              );

    const handleGuess = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed || finished) return;

        const match = countries.find(
            (c) => c.name.toLowerCase() === trimmed.toLowerCase()
        );
        if (!match) return;

        if (attempts.some((a) => a.guess.toLowerCase() === trimmed.toLowerCase())) return;

        const isCorrect = match.name.toLowerCase() === challenge.country.toLowerCase();

        const targetCoords = countryCoords[challenge.countryCode];
        const guessCoords = countryCoords[match.code];
        let distance: number | null = null;
        let direction: string | null = null;

        if (targetCoords && guessCoords && !isCorrect) {
            distance = haversineDistance(
                guessCoords[0], guessCoords[1],
                targetCoords[0], targetCoords[1]
            );
            direction = bearing(
                guessCoords[0], guessCoords[1],
                targetCoords[0], targetCoords[1]
            );
        }

        const newAttempts: Attempt[] = [
            { guess: match.name, correct: isCorrect, distance, direction },
            ...attempts,
        ];

        setAttempts(newAttempts);
        setGuess("");

        if (!isCorrect) setRevealed((p) => p + 1);

        if (isCorrect || newAttempts.length >= MAX_ATTEMPTS) {
            setRevealed(MAX_ATTEMPTS);
            setFinished(true);
            onFinish({
                challenge_id: challenge.challengeId,
                completed: isCorrect,
                score: isCorrect ? Math.max(10, 100 - (newAttempts.length - 1) * 15) : 0,
                attempts_used: newAttempts.length,
                correct_answers: isCorrect ? 1 : 0,
                time_seconds: 0,
            });
        }
    };

    return (
        <div className="flagle-page">
            {!hideNavbar && <Navbar activeLink="home" />}
            <main className="content">
                <div className="title">
                    <h1>Flagle</h1>
                    <p>Guess the country from its flag in {MAX_ATTEMPTS} attempts</p>
                </div>

                <div className="flagle-content">
                    <div className="flag-container">
                        <img src={challenge.flagUrl} className="flag-image" alt="Flag" />
                        <div className="flag-overlay">
                            {[...Array(MAX_ATTEMPTS)].map((_, i) => (
                                <div key={i} className={`tile ${i < revealed ? "revealed" : "grey"}`} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flagle-input">
                            <input
                                type="text"
                                placeholder="Type a country name..."
                                value={guess}
                                onChange={(e) => setGuess(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleGuess(guess)}
                                disabled={finished}
                                autoComplete="off"
                            />
                        </div>

                        {filtered.length > 0 && !finished && (
                            <div className="autocomplete">
                                {filtered.slice(0, 8).map((c) => (
                                    <div
                                        key={c.code}
                                        className="autocomplete-item"
                                        onClick={() => handleGuess(c.name)}
                                    >
                                        {c.name}
                                    </div>
                                ))}
                            </div>
                        )}

                        <p>Attempts remaining: {MAX_ATTEMPTS - attempts.length}</p>

                        <div className="flagle-attempts">
                            {attempts.map((attempt, i) => (
                                <div
                                    className={`attempt ${attempt.correct ? "correct" : "wrong"}`}
                                    key={i}
                                >
                                    <p>{attempt.guess}</p>
                                    {!attempt.correct && attempt.distance !== null && (
                                        <p>{attempt.distance.toLocaleString()} km {attempt.direction}</p>
                                    )}
                                    {attempt.correct && <p>✓ Correct!</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
