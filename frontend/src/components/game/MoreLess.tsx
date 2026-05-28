import { Link } from "react-router-dom";
import { useState } from "react";

import "./MoreLess.css";

const mockData = {
  challengeData: {
    challengeId: "moreless-test",

    label: "Population",

    items: [
      {
        name: "Russia",
        value: 144000000,
      },
      {
        name: "Canada",
        value: 39000000,
      },
      {
        name: "Brazil",
        value: 214000000,
      },
      {
        name: "Germany",
        value: 84000000,
      },
      {
        name: "Japan",
        value: 125000000,
      },
      {
        name: "USA",
        value: 333000000,
      },
    ],
  },
};

const MAX_ATTEMPTS = 5;

interface MoreLessProps {
  data: any;
  onFinish: (result: any) => void;
}

export default function MoreLess({ data, onFinish }: MoreLessProps) {
  const challengeData = data.challengeData ?? mockData.challengeData;

  const items = challengeData?.items ?? [];

  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [sliding, setSliding] = useState(false);

  const [showAnswer, setShowAnswer] = useState(false);

  const leftItem = items[roundIndex];
  const rightItem = items[roundIndex + 1];

  const [selectedGuess, setSelectedGuess] = useState<"more" | "less" | null>(
    null,
  );

  const [guessResult, setGuessResult] = useState<"correct" | "wrong" | null>(
    null,
  );

  const handleGuess = (guess: "more" | "less") => {
    if (finished) return;

    const left = leftItem.value;
    const right = rightItem.value;

    const correct = guess === "more" ? right > left : right < left;

    if (correct) {
      setScore((prev) => prev + 1);
    }

    setSelectedGuess(guess);
    setGuessResult(correct ? "correct" : "wrong");

    setShowAnswer(true);

    setTimeout(() => {
      setSliding(true);
    }, 700);

    const isLastRound =
      roundIndex + 2 >= items.length || roundIndex + 1 >= MAX_ATTEMPTS;

    setTimeout(() => {
      if (isLastRound) {
        const finalScore = correct ? score + 1 : score;

        setFinished(true);

        onFinish?.({
          challenge_id: challengeData?.challengeId,
          completed: finalScore > 0,
          score: finalScore * 10,
          attempts_used: roundIndex + 1,
          correct_answers: finalScore,
          time_seconds: 0,
        });

        return;
      }

      setRoundIndex((prev) => prev + 1);

      setSliding(false);
      setShowAnswer(false);
      setSelectedGuess(null);
      setGuessResult(null);
    }, 1500);
  };

  return (
    <div className="more-less-page">
      <main className="main-more-less-content">
        <div className="more-less-top">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
          <div className="more-less-top-right">
            <p>
              Round: {roundIndex + 1}/{MAX_ATTEMPTS}
            </p>
            <p>Score: {score}</p>
          </div>
        </div>
        <div className="more-less-title">
          <h1>More or Less</h1>
          <p>Guess which value is higher</p>
        </div>

        <div className="more-less-content">
          <div className="more-less-wrapper">
            <div className="more-less-original">
              <p>{challengeData?.label}</p>
              <h2>{leftItem.name}</h2>
              <div className="more-less-original-value">
                <p>{leftItem.value}</p>
              </div>
            </div>
            <div className={`more-less-guess ${sliding ? "slide-left" : ""}`}>
              <p>{challengeData?.label}</p>
              <h2>{rightItem.name}</h2>
              <div className="more-less-guess-value">
                <p>?</p>
              </div>
              <div className="more-less-buttons">
                <button
                  className={`guess-more-button ${
                    selectedGuess === "more"
                      ? guessResult === "correct"
                        ? "correct"
                        : "wrong"
                      : ""
                  } `}
                  onClick={() => handleGuess("more")}
                >
                  More
                </button>
                <button
                  className={`guess-less-button ${selectedGuess === "less" ? (guessResult === "correct" ? "correct" : "wrong") : ""}`}
                  onClick={() => handleGuess("less")}
                >
                  Less
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
