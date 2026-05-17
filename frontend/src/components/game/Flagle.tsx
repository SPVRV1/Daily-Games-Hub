import { useState } from "react";
import Navbar from "../Navbar";
import "./Flagle.css";
import { GameResult } from "../../types/game.types";

const MAX_ATTEMPTS = 6;

interface FlagleProps {
  data?: any;
  onFinish?: (result: GameResult) => void;
}

const testData = {
  gameType: "flagle",
  date: "2026-01-01",
  challengeData: {
    challengeId: "test-1",
    country: "France",
    flagUrl: "https://flagcdn.com/w320/fr.png",
  },
};

const testDistances = [
  { distance: 800, direction: "N" },
  { distance: 600, direction: "S" },
  { distance: 400, direction: "E" },
  { distance: 200, direction: "W" },
  { distance: 1000, direction: "NE" },
  { distance: 50, direction: "SW" },
];

const countryList = [
  "France",
  "Germany",
  "Italy",
  "Spain",
  "Slovakia",
  "Slovenia",
  "Serbia",
  "Sweden",
  "Switzerland",
  "Turkey",
  "Ukraine",
  "United Kingdom",
  "Argentina",
  "Australia",
];

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

export default function Flagle({ data, onFinish }: FlagleProps) {
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState<
    { guess: string; correct: boolean }[]
  >([]);
  const [finished, setFinished] = useState(false);
  const [revealed, setRevealed] = useState(0);

  const gameData = data?.challengeData ?? testData;

  const filteredCountries =
    guess.trim().length === 0
      ? []
      : countryList.filter((country) =>
          country.toLowerCase().includes(guess.toLowerCase()),
        );

  const handleGuess = (value: string) => {
    if (!value.trim() || finished) return;

    const normalized = value.trim().toLowerCase();

    if (!countryList.some(c => c.toLowerCase() === normalized) || attempts.some((a) => a.guess.toLowerCase() === normalized)) return;

    const isCorrect =
      value.toLowerCase() === gameData.challengeData.country.toLowerCase();

    const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);

    const newAttempts = [{ guess: formattedValue, correct: isCorrect },...attempts];
    setAttempts(newAttempts);
    setGuess("");

    if (!isCorrect) {
      setRevealed((prev) => prev + 1);
    }

    if (isCorrect || newAttempts.length >= MAX_ATTEMPTS) {
      setRevealed(MAX_ATTEMPTS);

      setFinished(true);

      onFinish?.({
        completed: isCorrect,
        challenge_id: gameData.challengeData.challengeId,
        score: isCorrect ? 100 : 0,
        attempts_used: newAttempts.length,
        correct_answers: isCorrect ? 1 : 0,
        time_seconds: 0,
      });
    }
  };
  return (
    <div className="flagle-page">
      {/* Navbar */}
      <Navbar activeLink="home" />

      {/* Content */}
      <main className="content">
        {/* Title */}
        <div className="title">
          <h1>Flagle</h1>
          <p>Guess the country from it's flag in 6 attempts</p>
        </div>

        {/* Game Content */}
        <div className="flagle-content">
          <div className="flag-container">
            <img src={gameData.challengeData.flagUrl} className="flag-image" />

            <div className="flag-overlay">
              {[...Array(MAX_ATTEMPTS)].map((_, index) => (
                <div
                  key={index}
                  className={`tile ${index < revealed ? "revealed" : "grey"}`}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="flagle-input">
              <input
                type="text"
                id="flagle-country"
                name="flagle-country"
                placeholder="Type a country name..."
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGuess(guess)}
                disabled={finished}
              />
            </div>

            {filteredCountries.length > 0 && !finished && (
              <div className="autocomplete">
                {filteredCountries.map((country) => (
                  <div
                    key={country}
                    className="autocomplete-item"
                    onClick={() => {
                      handleGuess(country);
                    }}
                  >
                    {country}
                  </div>
                ))}
              </div>
            )}

            <p>Attempts remaining: {MAX_ATTEMPTS - attempts.length}</p>

            <div className="flagle-attempts">
              {attempts.map((attempt, index) => (
                <div
                  className={`attempt ${attempt.correct ? "correct" : "wrong"}`}
                  key={index}
                >
                  <p>{attempt.guess}</p>
                  <p>
                    {testDistances[index].distance} km{" "}
                    {directionToArrow(testDistances[index].direction)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
