import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "../../components/Navbar";

import "./Wordle.css";

const MAX_ATTEMPTS = 6;
const WORD_LENGTH = 5;

const FLIP_DELAY = 250;

export default function Wordle({ data, onFinish }: { 
    data?: any;
    onFinish?: (result: any) => void;
}) {
    const ANSWER = data?.challengeData?.answer ?? "HELLO"; // dummy word for testing win
    const VALID_GUESSES = data?.challengeData?.validGuesses ?? [ // dummy words for testing valid guesses
        "HELLO",
        "WORLD",
        "APPLE",
        "HOUSE",
        "WATER",
        "LIGHT"
    ];

    const [language, setLanguage] = useState<"en" | "sl">("en");

    const [currentGuess, setCurrentGuess] = useState("");
    const [guesses, setGuesses] = useState<string[]>([]);
    const [statuses, setStatuses] = useState<string[][]>([]); 
    const [keyboardStatus, setKeyboardStatus] = useState<Record<string, string>>({});
    const [gameOver, setGameOver] = useState(false);

    const [popTile, setPopTile] = useState<string | null>(null);
    const [animating, setAnimating] = useState(false);
    const [toast, setToast] = useState("");

    // Typing letters in row
    const addLetter = (letter: string) => {
        if (gameOver || animating)
            return;

        if (currentGuess.length < WORD_LENGTH) {
            const row = guesses.length;
            const col = currentGuess.length;

            setCurrentGuess(prev => prev + letter);

            const key = `${row}-${col}`;
            setPopTile(key);

            setTimeout(() => {
                setPopTile(null);
            }, 120);
        }
    };

    // Deleting letters from row
    const removeLetter = () => {
        if (gameOver || animating)
            return;

        setCurrentGuess(prev => prev.slice(0, -1));
    };

    // Checking correct letters in guess
    const evaluateGuess = (guess: string) => {
        const target = ANSWER.split("");
        const guessArr = guess.split("");

        const result = Array(WORD_LENGTH).fill("gray");

        // Correct letter correct spot -> GREEN
        for (let i = 0; i < WORD_LENGTH; i++) {
            if (guessArr[i] === target[i]) {
                result[i] = "green";
                target[i] = "*";
            }
        }

        // Correct letter wrong spot -> YELLOW
        for (let i = 0; i < WORD_LENGTH; i++) {
            if (result[i] === "green")
                continue;

            const index = target.indexOf(guessArr[i]);
            if (index !== -1) {
                result[i] = "yellow";
                target[index] = "*";
            }
        }
        return result;
    };

    // Toast for word not valid or word not long enough
    const showToast = (message: string) => {
        setToast(message);

        setTimeout(() => {
            setToast("");
        }, 1800);
    };

    // Submitting guess
    const submitGuess = async () => {
        if (gameOver || animating)
            return;

        if (currentGuess.length !== WORD_LENGTH) {
            showToast("Not enough letters");
            return;
        }
        const guess = currentGuess.toUpperCase();

        if (!VALID_GUESSES.includes(guess)) {
            showToast("Not in word list");
            return;
        }
        const result = evaluateGuess(guess);

        setAnimating(true);
        setCurrentGuess("");

        const rowIndex = guesses.length;

        setGuesses(prev => [...prev, guess]);
        setStatuses(prev => [...prev, []]);

        // Word flips to reveal correct letters
        for (let i = 0; i < WORD_LENGTH; i++) {
            await new Promise(res => setTimeout(res, FLIP_DELAY));

            setStatuses(prev => {
                const copy = [...prev];
                const newRow = copy[rowIndex] ? [...copy[rowIndex]] : [];
                newRow[i] = result[i];
                copy[rowIndex] = newRow;
                return copy;
            });
        }

        // Keyboard also updates tile colors of letters in guess
        const newMap = { ...keyboardStatus };

        guess.split("").forEach((letter, i) => {
            const current = newMap[letter];

            if (result[i] === "green")
                newMap[letter] = "green";
            
            else if (result[i] === "yellow" && current !== "green")
                newMap[letter] = "yellow";
            
            else if (!current)
                newMap[letter] = "gray";
        });

        setKeyboardStatus(newMap);

        // Game end
        setTimeout(() => {
            setAnimating(false);

            const isWin = guess === ANSWER;
            const isLoss = guesses.length + 1 === MAX_ATTEMPTS;

            if (isWin || isLoss) {
                setGameOver(true);

                onFinish?.({
                    challenge_id: data?.date ?? "wordle",
                    completed: isWin,
                    attempts_used: guesses.length + 1,
                    correct_answers: isWin ? 1 : 0,
                    time_seconds: 0,
                    score: isWin ? 100 : 0
                });
            }
        }, 1200);
    };

    // Enabled using physical keyboard, not just the on screen one
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toUpperCase();

            if (gameOver || animating)
                return;

            if (key === "ENTER")
                submitGuess();

            else if (key === "BACKSPACE")
                removeLetter();

            else if (/^[A-Z]$/.test(key))
                addLetter(key);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [gameOver, animating, submitGuess]);

    const rows = [];

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        if (i < guesses.length) {
            rows.push({
                letters: guesses[i].split(""),
                colors: statuses[i] || []
            });
        }
        else if (i === guesses.length) {
            rows.push({
                letters: currentGuess.split(""),
                colors: []
            });
        }
        else {
            rows.push({
                letters: [],
                colors: []
            });
        }
    }

    return (
        <div className="container auth-container w-full">
            <Navbar/>

            <main className="page">

                {/* Row for link to home page and language switch button */}
                <div className="top-row">
                    <Link to="/" className="back-link">← Back to Home</Link>

                    <div className="language-switch">
                        <button
                            className={language === "en" ? "active" : ""}
                            onClick={() => setLanguage("en")}
                        >
                            English
                        </button>

                        <button
                            className={language === "sl" ? "active" : ""}
                            onClick={() => setLanguage("sl")}
                        >
                            Slovenian
                        </button>
                    </div>
                </div>

                {/* Wordle part of site */}
                <section className="wordle-wrapper">

                    {toast && (
                        <div className="toast">
                            {toast}
                        </div>
                    )}

                    <h1>Wordle</h1>
                    <p>Guess the 5-letter word in 6 attempts</p>

                    {/* Wordle card */}
                    <div className="wordle-game-card">
                        <div className="wordle-grid">
                            {rows.map((row, rowIndex) =>
                                Array.from({ length: WORD_LENGTH }).map((_, i) => {
                                    const letter = row.letters[i] || "";
                                    const color = row.colors?.[i] || "";

                                    return (
                                        <div
                                            key={`${rowIndex}-${i}`}
                                            className={`tile ${color} ${popTile === `${rowIndex}-${i}` ? "pop" : ""}`}
                                        >
                                            {letter}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Keyboard part */}
                        <div className="keyboard">

                            {/* ROW 1 */}
                            <div className="keyboard-row">
                                {"QWERTYUIOP".split("").map(k => (
                                    <button
                                        key={k}
                                        className={`key ${keyboardStatus[k] || ""}`}
                                        onClick={() => addLetter(k)}
                                    >
                                        {k}
                                    </button>
                                ))}
                            </div>

                            {/* ROW 2 */}
                            <div className="keyboard-row">
                                {"ASDFGHJKL".split("").map(k => (
                                    <button
                                        key={k}
                                        className={`key ${keyboardStatus[k] || ""}`}
                                        onClick={() => addLetter(k)}
                                    >
                                        {k}
                                    </button>
                                ))}
                            </div>

                            {/* ROW 3 */}
                            <div className="keyboard-row">

                                <button className="key large" onClick={submitGuess}>
                                    ENTER
                                </button>

                                {"ZXCVBNM".split("").map(k => (
                                    <button
                                        key={k}
                                        className={`key ${keyboardStatus[k] || ""}`}
                                        onClick={() => addLetter(k)}
                                    >
                                        {k}
                                    </button>
                                ))}

                                <button className="key large" onClick={removeLetter}>
                                    BACK
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}