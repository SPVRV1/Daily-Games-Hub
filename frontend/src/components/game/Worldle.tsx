import { useState } from "react";
import { Link } from "react-router-dom";

import "./Worldle.css";

const MAX_ATTEMPTS = 6;

// Dummy data to test distances between countries
const testDistances = [
    { distance: 800, direction: "N" },
    { distance: 600, direction: "S" },
    { distance: 400, direction: "E" },
    { distance: 200, direction: "W" },
    { distance: 1000, direction: "NE" },
    { distance: 50, direction: "SW" },
];

// Dummy data for arrows to appear in attempt based on the test location of the country
const directionToArrow = (direction: string) => {
    const directions: Record<string, string> = {
        N: "↑",
        S: "↓",
        E: "→",
        W: "←",
        NE: "↗",
        NW: "↖",
        SE: "↘",
        SW: "↙",
    };

    return directions[direction] || "";
};

export default function Worldle({ data, onFinish }: any) {
    const [guess, setGuess] = useState("");
    const [guesses, setGuesses] = useState<any[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [toast, setToast] = useState("");

    const TODAYS_COUNTRY = data?.challengeData?.answer ?? "Slovenia"; // Dummy data for answer
    
    // Dummy data for valid country guesses
    const VALID_COUNTRIES =
        data?.challengeData?.validCountries ?? [
            "Slovenia",
            "Germany",
            "France",
            "Italy",
            "Croatia",
            "Austria",
            "Hungary"
        ];

    // Dummy data for country silhouette testing
    const testSloveniaGeoJSON = {
        type: "Feature",
        id: "SVN",
        properties: { name: "Slovenia" },
        geometry: {
            type: "Polygon",
            coordinates: [[
                [13.806475, 46.509306],
                [14.632472, 46.431817],
                [15.137092, 46.658703],
                [16.011664, 46.683611],
                [16.202298, 46.852386],
                [16.370505, 46.841327],
                [16.564808, 46.503751],
                [15.768733, 46.238108],
                [15.67153, 45.834154],
                [15.323954, 45.731783],
                [15.327675, 45.452316],
                [14.935244, 45.471695],
                [14.595109, 45.634941],
                [14.411968, 45.466166],
                [13.71506, 45.500324],
                [13.93763, 45.591016],
                [13.69811, 46.016778],
                [13.806475, 46.509306]
            ]]
        }
    };

    // Testing the silhouette
    const SILHOUETTE = data?.challengeData?.silhouette ?? geoJSONToPath(testSloveniaGeoJSON);

    // For countries to appear on autocomplete dropdown while user is typing guess
    const filteredCountries =
        guess.trim().length === 0
            ? []
            : VALID_COUNTRIES.filter((country: string) =>
                    country.toLowerCase().includes(guess.toLowerCase())
                );

    // Helper function to convert geojson data to svg silhouette of the country
    function geoJSONToPath(feature: any) {
        const coords = feature.geometry.coordinates[0];
        const lons = coords.map((c: number[]) => c[0]);
        const lats = coords.map((c: number[]) => c[1]);

        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);

        const scale = (lon: number, lat: number) => {
            const x = ((lon - minLon) / (maxLon - minLon)) * 230;
            const y = ((maxLat - lat) / (maxLat - minLat)) * 150;
            return [x, y];
        };

        let path = "";

        coords.forEach((c: number[], i: number) => {
            const [x, y] = scale(c[0], c[1]);
            path += i === 0 ? `M${x} ${y}` : ` L${x} ${y}`;
        });

        path += " Z";

        return path;
    }

    // Hints for user
    const showToast = (message: string) => {
        setToast(message);

        setTimeout(() => {
            setToast("");
        }, 1800);
    };

    const submitGuess = (value?: string) => {
        const raw = (value ?? guess).trim();

        if (gameOver)
            return;

        if (!raw) {
            showToast("Enter a country");
            return;
        }
        const formattedGuess = raw;

        if (guesses.some(g => g.name.toLowerCase() === formattedGuess.toLowerCase())) {
            showToast("Already guessed this country");
            return;
        }
        if (!VALID_COUNTRIES.includes(formattedGuess)) {
            showToast("Country not found");
            return;
        }
        const isCorrect = formattedGuess.toLowerCase() === TODAYS_COUNTRY.toLowerCase();

        const newGuess = {
            name: formattedGuess,
            correct: isCorrect
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
                score: isCorrect ? 100 : 0
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
                    <Link to="/" className="back-link">← Back to Home</Link>
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
                                <path d={SILHOUETTE} className="country-shape" />
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
                                className={`attempt ${g.correct ? "correct" : "wrong"}`}
                            >
                                <p>{g.name}</p>

                                {!g.correct && (
                                    <p>
                                        {testDistances[index] && (
                                            <>
                                                {testDistances[index].distance ?? 0} km{" "}
                                                {directionToArrow(testDistances[index].direction ?? "")}
                                            </>
                                        )}
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
                                    if (e.key === "Enter")
                                        submitGuess();
                                }}
                                disabled={gameOver}
                            />

                            {/* Autocomplete dropdown menu */}
                            {filteredCountries.length > 0 && !gameOver && (
                                <div className="worldle-autocomplete">
                                    {filteredCountries.slice(0, 8).map((country: string) => (
                                        <div
                                            key={country}
                                            className="autocomplete-item"
                                            onClick={() => { submitGuess(country);}}
                                        >
                                            {country}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                className="worldle-button"
                                onClick={handleSubmitClick}
                                disabled={gameOver}
                            >
                                Answer
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}