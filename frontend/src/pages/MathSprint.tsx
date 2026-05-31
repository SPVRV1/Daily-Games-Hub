import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import GamePage from "../components/game/GamePage";
import { GameChallenge, GameResult } from "../types/game.types";
import "./MathSprint.css";

type Screen = "idle" | "playing";
type MathSprintDifficulty = "easy" | "medium" | "hard";

const difficultyOptions: Array<{
  value: MathSprintDifficulty;
  title: string;
  description: string;
}> = [
  { value: "easy", title: "Easy", description: "Addition only" },
  { value: "medium", title: "Medium", description: "Addition and subtraction" },
  {
    value: "hard",
    title: "Hard",
    description: "Addition, subtraction, and multiplication",
  },
];

interface MathSprintQuestion {
  id: number;
  left: number;
  right: number;
  operator: string;
  expression: string;
  answer: number;
}

interface MathSprintData {
  title: string;
  difficulty: MathSprintDifficulty;
  total_questions: number;
  time_limit_seconds: number;
  questions: MathSprintQuestion[];
}

const difficultyStorageKey = "math-sprint:selected-difficulty";
const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const readStoredDifficulty = (): MathSprintDifficulty | null => {
  try {
    const stored = localStorage.getItem(difficultyStorageKey);

    if (stored === "easy" || stored === "medium" || stored === "hard") {
      return stored;
    }

    return null;
  } catch {
    return null;
  }
};

function MathSprintGame({
  challenge,
  onFinish,
}: {
  challenge: GameChallenge;
  onFinish: (result: GameResult) => void;
}) {
  const data = challenge.challengeData as unknown as MathSprintData;
  const questions = data.questions;
  const timeLimit = data.time_limit_seconds ?? 60;
  const storageKey = `math-sprint:${challenge.challenge_id ?? challenge.date}:${data.difficulty}`;

  type MathSprintProgress = {
    timeLeft: number;
    correct: number;
    wrong: number;
    currentIndex: number;
    inputValue: string;
  };

  const loadProgress = (): MathSprintProgress | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return null;
      return JSON.parse(saved) as MathSprintProgress;
    } catch {
      return null;
    }
  };

  const savedProgress = loadProgress();

  const [screen, setScreen] = useState<Screen>(
    savedProgress ? "playing" : "idle",
  );
  const [timeLeft, setTimeLeft] = useState(
    savedProgress?.timeLeft ?? timeLimit,
  );
  const [correct, setCorrect] = useState(savedProgress?.correct ?? 0);
  const [wrong, setWrong] = useState(savedProgress?.wrong ?? 0);
  const [currentIndex, setCurrentIndex] = useState(
    savedProgress?.currentIndex ?? 0,
  );
  const [inputValue, setInputValue] = useState(savedProgress?.inputValue ?? "");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishedRef = useRef(false);

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function clearFeedbackTimer() {
    if (feedbackRef.current) {
      clearTimeout(feedbackRef.current);
      feedbackRef.current = null;
    }
  }

  function finishGame() {
    if (finishedRef.current) return;

    finishedRef.current = true;
    clearTimer();
    clearFeedbackTimer();

    const token = localStorage.getItem("token");
    const attemptsUsed = correct + wrong;
    const timeTaken = Math.max(0, timeLimit - timeLeft);

    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(difficultyStorageKey);
    } catch {
      // Ignore storage errors and still finish the game.
    }

    setScreen("idle");
    onFinish({
      challenge_id: challenge.challenge_id ?? "",
      difficulty: data.difficulty,
      score: 0,
      correct_answers: correct,
      time_seconds: timeTaken,
      attempts_used: attemptsUsed,
      completed: correct > 0,
    });

    void fetch(`${API}/api/user/data/game`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: "mathsprint",
        attempts: attemptsUsed,
        timeTaken,
        completed: correct > 0,
      }),
    }).catch((error) => {
      console.error("Failed to save MathSprint game to user profile:", error);
    });
  }

  useEffect(() => {
    if (screen !== "playing") return;
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      clearTimer();
    };
  }, [screen]);

  useEffect(() => {
    if (screen !== "playing") return;

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          timeLeft,
          correct,
          wrong,
          currentIndex,
          inputValue,
        }),
      );
    } catch {
      // Ignore storage errors; gameplay still continues normally.
    }
  }, [screen, storageKey, timeLeft, correct, wrong, currentIndex, inputValue]);

  useEffect(() => {
    if (timeLeft === 0 && screen === "playing") {
      finishGame();
    }
  }, [timeLeft, screen, correct, wrong]);

  useEffect(() => {
    if (screen === "playing" && currentIndex >= questions.length) {
      finishGame();
    }
  }, [currentIndex, screen, correct, wrong]);

  useEffect(() => {
    if (screen === "playing") inputRef.current?.focus();
  }, [screen, currentIndex]);

  function startGame() {
    finishedRef.current = false;
    clearTimer();
    clearFeedbackTimer();
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore storage errors and start a fresh run anyway.
    }
    setTimeLeft(timeLimit);
    setCorrect(0);
    setWrong(0);
    setCurrentIndex(0);
    setInputValue("");
    setFeedback(null);
    setScreen("playing");
  }

  function submitAnswer() {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    if (finishedRef.current) return;
    clearFeedbackTimer();

    const currentQuestion = questions[currentIndex];
    if (val === currentQuestion.answer) {
      setCorrect((c) => c + 1);
      setFeedback("correct");
    } else {
      setWrong((w) => w + 1);
      setFeedback("wrong");
    }

    feedbackRef.current = setTimeout(() => {
      setInputValue("");
      setFeedback(null);
      setCurrentIndex((i) => i + 1);
    }, 700);
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="ms-screen">
      {screen === "idle" && (
        <>
          <a className="ms-back" href="/">
            ← Back to Home
          </a>
          <div className="ms-header">
            <h1 className="ms-title">Math Sprint</h1>
            <p className="ms-subtitle">
              Solve as many math problems as you can in {timeLimit} seconds
            </p>
          </div>
          <div className="ms-card">
            <div className="ms-icon-circle">
              <img
                src="/icons/MathSprint1.png"
                alt="Math Sprint"
                width="72"
                height="72"
                style={{ borderRadius: "50%", objectFit: "cover" }}
              />
            </div>
            <h2 className="ms-ready-title">Ready to start?</h2>
            <p className="ms-ready-desc">
              You'll have {timeLimit} seconds to solve {data.total_questions}{" "}
              math problems.
              <br />
              Test your speed and accuracy!
            </p>
            <button className="ms-btn-primary" onClick={startGame}>
              Start Game
            </button>
          </div>
        </>
      )}

      {screen === "playing" && currentQuestion && (
        <>
          <div className="ms-header">
            <h1 className="ms-title">Math Sprint</h1>
            <p className="ms-subtitle">
              Solve as many problems as you can in {timeLimit} seconds
            </p>
          </div>
          <div className="ms-stats-row">
            <div
              className={`ms-stat-box${timeLeft <= 10 ? " ms-stat-box--warning" : ""}`}
            >
              <div className="ms-stat-label">Time Left</div>
              <div className="ms-stat-value ms-stat-value--orange">
                {timeLeft}s
              </div>
            </div>
            <div className="ms-stat-box">
              <div className="ms-stat-label">Question</div>
              <div className="ms-stat-value ms-stat-value--green">
                {currentIndex + 1}/{questions.length}
              </div>
            </div>
          </div>
          <div className="ms-progress-wrap">
            <div
              className="ms-progress-fill"
              style={{ width: `${(timeLeft / timeLimit) * 100}%` }}
            />
          </div>
          <div className="ms-question-card">
            <div className="ms-question">{currentQuestion.expression} = ?</div>
            <div
              className={`ms-feedback${feedback ? ` ms-feedback--${feedback}` : ""}`}
            >
              {feedback === "correct" && "✓ Correct!"}
              {feedback === "wrong" &&
                `✗ Wrong — answer was ${currentQuestion.answer}`}
            </div>
            <input
              ref={inputRef}
              className={`ms-input${feedback ? ` ms-input--${feedback}` : ""}`}
              type="number"
              placeholder="Your answer"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
              autoComplete="off"
            />
            <button className="ms-btn-primary" onClick={submitAnswer}>
              Submit
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function MathSprint() {
  const [difficulty, setDifficulty] = useState<MathSprintDifficulty | null>(
    () => readStoredDifficulty(),
  );

  useEffect(() => {
    if (!difficulty) return;

    try {
      localStorage.setItem(difficultyStorageKey, difficulty);
    } catch {
      // Ignore storage errors and keep the current session usable.
    }
  }, [difficulty]);

  return (
    <>
      <Navbar activeLink="none" />
      {!difficulty ? (
        <div className="ms-screen">
          <a className="ms-back" href="/">
            ← Back to Home
          </a>
          <div className="ms-header">
            <h1 className="ms-title">Math Sprint</h1>
            <p className="ms-subtitle">Choose a difficulty before starting</p>
          </div>
          <div className="ms-card">
            <div className="ms-icon-circle">
              <img
                src="/icons/MathSprint1.png"
                alt="Math Sprint"
                width="72"
                height="72"
                style={{ borderRadius: "50%", objectFit: "cover" }}
              />
            </div>
            <h2 className="ms-ready-title">Pick your challenge</h2>
            <p className="ms-ready-desc">
              Easy uses addition only, medium adds subtraction, and hard
              includes multiplication too.
            </p>
            <div className="ms-difficulty-list">
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`ms-difficulty-option${difficulty === option.value ? " ms-difficulty-option--selected" : ""}`}
                  onClick={() => setDifficulty(option.value)}
                >
                  <span className="ms-difficulty-option__title">
                    {option.title}
                  </span>
                  <span className="ms-difficulty-option__description">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <GamePage
          gameType="mathsprint"
          challengeQueryParams={{ difficulty }}
          renderGame={(challenge, onFinish) => (
            <MathSprintGame challenge={challenge} onFinish={onFinish} />
          )}
        />
      )}
    </>
  );
}
