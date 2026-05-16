import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import "./MathSprint.css";

type Screen = "idle" | "playing" | "finished";
type Question = { text: string; answer: number };

function generateQuestion(): Question {
    const ops = ["+", "-", "×", "÷"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a: number, b: number, answer: number;
    if (op === "+")      { a = Math.floor(Math.random()*50)+1;  b = Math.floor(Math.random()*50)+1;  answer = a+b; }
    else if (op === "-") { a = Math.floor(Math.random()*50)+10; b = Math.floor(Math.random()*a)+1;   answer = a-b; }
    else if (op === "×") { a = Math.floor(Math.random()*12)+1;  b = Math.floor(Math.random()*12)+1;  answer = a*b; }
    else                 { b = Math.floor(Math.random()*11)+1;  answer = Math.floor(Math.random()*11)+1; a = b*answer; }
    return { text: `${a} ${op} ${b} = ?`, answer };
}

export default function MathSprint() {
    const [screen, setScreen] = useState<Screen>("idle");
    const [timeLeft, setTimeLeft] = useState(60);
    const [score, setScore] = useState(0);
    const [correct, setCorrect] = useState(0);
    const [wrong, setWrong] = useState(0);
    const [question, setQuestion] = useState<Question>(generateQuestion());
    const [inputValue, setInputValue] = useState("");
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (screen !== "playing") return;
        timerRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) { clearInterval(timerRef.current!); setScreen("finished"); return 0; }
                return t - 1;
            });
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [screen]);

    useEffect(() => {
        if (screen === "playing") inputRef.current?.focus();
    }, [screen, question]);

    function startGame() {
        setTimeLeft(60);
        setScore(0);
        setCorrect(0);
        setWrong(0);
        setInputValue("");
        setFeedback(null);
        setQuestion(generateQuestion());
        setScreen("playing");
    }

    function submitAnswer() {
        const val = parseInt(inputValue);
        if (isNaN(val)) return;
        if (feedbackRef.current) clearTimeout(feedbackRef.current);
        if (val === question.answer) {
            setCorrect((c) => c + 1);
            setScore((s) => s + 10);
            setFeedback("correct");
        } else {
            setWrong((w) => w + 1);
            setFeedback("wrong");
        }
        feedbackRef.current = setTimeout(() => {
            setInputValue("");
            setFeedback(null);
            setQuestion(generateQuestion());
        }, 700);
    }

    const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;

    return (
        <>
            <Navbar activeLink="none" />

            {screen === "idle" && (
                <div className="ms-screen">
                    <a className="ms-back">← Back to Home</a>
                    <div className="ms-header">
                        <h1 className="ms-title">Math Sprint</h1>
                        <p className="ms-subtitle">Solve as many math problems as you can in 60 seconds</p>
                    </div>
                    <div className="ms-card">
                        <div className="ms-icon-circle">
                            <img src="/icons/MathSprint1.png" alt="Math Sprint" width="72" height="72" style={{ borderRadius: "50%", objectFit: "cover" }} />
                        </div>
                        <h2 className="ms-ready-title">Ready to start?</h2>
                        <p className="ms-ready-desc">
                            You'll have 60 seconds to solve as many math problems as possible.<br />
                            Test your speed and accuracy!
                        </p>
                        <button className="ms-btn-primary" onClick={startGame}>Start Game</button>
                    </div>
                </div>
            )}

            {screen === "playing" && (
                <div className="ms-screen">
                    <div className="ms-header">
                        <h1 className="ms-title">Math Sprint</h1>
                        <p className="ms-subtitle">Solve as many problems as you can in 60 seconds</p>
                    </div>
                    <div className="ms-stats-row">
                        <div className={`ms-stat-box${timeLeft <= 10 ? " ms-stat-box--warning" : ""}`}>
                            <div className="ms-stat-label">Time Left</div>
                            <div className="ms-stat-value ms-stat-value--orange">{timeLeft}s</div>
                        </div>
                        <div className="ms-stat-box">
                            <div className="ms-stat-label">Score</div>
                            <div className="ms-stat-value ms-stat-value--green">{score}</div>
                        </div>
                    </div>
                    <div className="ms-progress-wrap">
                        <div className="ms-progress-fill" style={{ width: `${(timeLeft / 60) * 100}%` }} />
                    </div>
                    <div className="ms-question-card">
                        <div className="ms-question">{question.text}</div>
                        <div className={`ms-feedback${feedback ? ` ms-feedback--${feedback}` : ""}`}>
                            {feedback === "correct" && "✓ Correct! +10"}
                            {feedback === "wrong"   && `✗ Wrong — answer was ${question.answer}`}
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
                        <button className="ms-btn-primary" onClick={submitAnswer}>Submit</button>
                    </div>
                </div>
            )}

            {screen === "finished" && (
                <div className="ms-screen">
                    <div className="ms-overlay">
                        <div className="ms-modal">
                            <div className="ms-modal-emoji">
                                {score >= 100 ? "🏆" : score >= 50 ? "🎉" : "💪"}
                            </div>
                            <h2 className="ms-modal-title">
                                {score >= 100 ? "Outstanding!" : score >= 50 ? "Great job!" : "Keep practicing!"}
                            </h2>
                            <p className="ms-modal-subtitle">Here's how you did</p>
                            <div className="ms-results-grid">
                                <div className="ms-result-stat">
                                    <div className="ms-result-label">Final Score</div>
                                    <div className="ms-result-value ms-result-value--green">{score}</div>
                                </div>
                                <div className="ms-result-stat">
                                    <div className="ms-result-label">Correct</div>
                                    <div className="ms-result-value ms-result-value--orange">{correct}</div>
                                </div>
                                <div className="ms-result-stat">
                                    <div className="ms-result-label">Wrong</div>
                                    <div className="ms-result-value ms-result-value--pink">{wrong}</div>
                                </div>
                                <div className="ms-result-stat">
                                    <div className="ms-result-label">Accuracy</div>
                                    <div className="ms-result-value ms-result-value--blue">{accuracy}%</div>
                                </div>
                            </div>
                            <button className="ms-btn-primary" onClick={startGame}>Play Again</button>
                            <button className="ms-btn-secondary" onClick={() => setScreen("idle")}>Back</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}