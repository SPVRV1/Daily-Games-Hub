import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    bearing,
    countryCoords,
    haversineDistance,
} from "../../data/countryCoords";

import "./Worldle.css";

const MAX_ATTEMPTS = 6;

interface Country {
    name: string;
    code: string;
}

interface Attempt {
    name: string;
    correct: boolean;
    distance: number | null;
    direction: string | null;
}

const directionToArrow = (direction: string | null) => direction ?? "";

export default function Worldle({ data, onFinish }: any) {
    const [guess, setGuess] = useState("");
    const [guesses, setGuesses] = useState<Attempt[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [toast, setToast] = useState("");
    const [countries, setCountries] = useState<Country[]>([]);

    const TODAYS_COUNTRY = data?.challengeData?.answer ?? "";
    const VALID_COUNTRIES: string[] = data?.challengeData?.validCountries ?? [];
    const SILHOUETTE = data?.challengeData?.silhouette ?? "";

    useEffect(() => {
        const loadCountries = async () => {
            try {
                const response = await fetch("/api/countries");
                const list: Country[] = await response.json();
                setCountries(
                    list.filter((country) =>
                        VALID_COUNTRIES.includes(country.name),
                    ),
                );
            } catch {
                setCountries([]);
            }
        };

        loadCountries();
    }, [VALID_COUNTRIES]);

    const countryByName = useMemo(() => {
        return new Map(
            countries.map((country) => [country.name.toLowerCase(), country]),
        );
    }, [countries]);

    const targetCountry =
        countryByName.get(TODAYS_COUNTRY.toLowerCase()) ?? null;

    // For countries to appear on autocomplete dropdown while user is typing guess
    const filteredCountries =
        guess.trim().length === 0
            ? []
            : VALID_COUNTRIES.filter((country) =>
                  country.toLowerCase().includes(guess.toLowerCase()),
              );

    // Hints for user
    const showToast = (message: string) => {
        setToast(message);

        setTimeout(() => {
            setToast("");
        }, 1800);
    };

    const submitGuess = (value?: string) => {
        const raw = (value ?? guess).trim();

        if (gameOver) return;

        if (!raw) {
            showToast("Enter a country");
            return;
        }
        const formattedGuess = raw;

        if (
            guesses.some(
                (g) => g.name.toLowerCase() === formattedGuess.toLowerCase(),
            )
        ) {
            showToast("Already guessed this country");
            return;
        }
        if (!VALID_COUNTRIES.includes(formattedGuess)) {
            showToast("Country not found");
            return;
        }

        const guessedCountry = countryByName.get(formattedGuess.toLowerCase());
        const isCorrect =
            formattedGuess.toLowerCase() === TODAYS_COUNTRY.toLowerCase();
        let distance: number | null = null;
        let direction: string | null = null;

        if (!isCorrect && guessedCountry && targetCountry) {
            const guessCoords =
                countryCoords[guessedCountry.code.toLowerCase()];
            const targetCoords =
                countryCoords[targetCountry.code.toLowerCase()];

            if (guessCoords && targetCoords) {
                distance = haversineDistance(
                    guessCoords[0],
                    guessCoords[1],
                    targetCoords[0],
                    targetCoords[1],
                );
                direction = bearing(
                    guessCoords[0],
                    guessCoords[1],
                    targetCoords[0],
                    targetCoords[1],
                );
            }
        }

        const newGuess = {
            name: formattedGuess,
            correct: isCorrect,
            distance,
            direction,
        };

        const updatedGuesses = [...guesses, newGuess];

        setGuesses(updatedGuesses);
        setGuess("");

        const isLoss = updatedGuesses.length >= MAX_ATTEMPTS;

        if (isCorrect || isLoss) {
            setGameOver(true);

            onFinish?.({
                challenge_id: data?.date ?? "worldle",
                completed: isCorrect,
                attempts_used: updatedGuesses.length,
                correct_answers: isCorrect ? 1 : 0,
                time_seconds: 0,
                score: isCorrect ? 100 : 0,
            });
        }
    };

    const handleSubmitClick = () => {
        submitGuess();
    };

    return (
        <div className="container auth-container w-full">
            <main className="worldle-page">
                {/* Top row */}
                <div className="top-row">
                    <Link to="/" className="back-link">
                        ← Back to Home
                    </Link>
                </div>

                {/* Worldle part of site */}
                <div className="wordle-wrapper">
                    {toast && <div className="toast">{toast}</div>}

                    <h1>Worldle</h1>
                    <p>Guess the country from its silhouette</p>

                    {/* Worldle card */}
                    <div className="worldle-game-card">
                        {/* Silhouette of country */}
                        <div className="silhouette-container">
                            <svg viewBox="0 0 230 150" className="country-svg">
                                <path
                                    d={SILHOUETTE}
                                    className="country-shape"
                                />
                            </svg>
                        </div>

                        {/* Attempts */}
                        <div className="attempt-counter">
                            Attempts: {guesses.length} / {MAX_ATTEMPTS}
                        </div>
                    </div>

                    {/* Guess results */}
                    <div className="guesses-container">
                        {guesses.map((g, index) => (
                            <div
                                key={index}
                                className={`attempt ${g.correct ? "correct" : "wrong"}`}>
                                <p>{g.name}</p>

                                {!g.correct && g.distance !== null && (
                                    <p>
                                        {g.distance.toLocaleString()} km{" "}
                                        {directionToArrow(g.direction)}
                                    </p>
                                )}

                                {g.correct && <p>✓ Correct!</p>}
                            </div>
                        ))}
                    </div>

                    {/* Input section */}
                    {!gameOver && (
                        <div className="worldle-input-card">
                            <input
                                type="text"
                                placeholder="Guess the country..."
                                value={guess}
                                className="worldle-input"
                                onChange={(e) => setGuess(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") submitGuess();
                                }}
                                disabled={gameOver}
                            />

                            {/* Autocomplete dropdown menu */}
                            {filteredCountries.length > 0 && !gameOver && (
                                <div className="worldle-autocomplete">
                                    {filteredCountries
                                        .slice(0, 8)
                                        .map((country: string) => (
                                            <div
                                                key={country}
                                                className="autocomplete-item"
                                                onClick={() => {
                                                    submitGuess(country);
                                                }}>
                                                {country}
                                            </div>
                                        ))}
                                </div>
                            )}

                            <button
                                className="worldle-button"
                                onClick={handleSubmitClick}
                                disabled={gameOver}>
                                Answer
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
