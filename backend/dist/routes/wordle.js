import { Router } from "express";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../data");
const answers = readFileSync(join(dataDir, "wordle-answers.txt"), "utf8")
    .split("\n")
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length === 5);
const validGuesses = new Set(readFileSync(join(dataDir, "wordle-valid-guesses.txt"), "utf8")
    .split("\n")
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length === 5));
const EPOCH = new Date("2021-06-19").getTime();
function getDayIndex() {
    const now = new Date();
    const utcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    return Math.floor((utcMidnight - EPOCH) / 86_400_000);
}
function getWordOfDay() {
    const dayIndex = getDayIndex();
    const wordNumber = dayIndex + 1;
    const word = answers[dayIndex % answers.length];
    const now = new Date();
    const date = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
    return { word, wordNumber, date };
}
const router = Router();
router.get("/word-of-day", (_req, res) => {
    const { wordNumber, date } = getWordOfDay();
    res.json({ ok: true, wordNumber, date });
});
router.post("/guess", (req, res) => {
    const { guess } = req.body;
    if (typeof guess !== "string" || guess.length !== 5) {
        return res.status(400).json({ ok: false, error: "Guess must be a 5-letter word" });
    }
    const normalised = guess.trim().toLowerCase();
    if (!validGuesses.has(normalised)) {
        return res.status(422).json({ ok: false, error: "Not a valid word" });
    }
    const { word } = getWordOfDay();
    const result = evaluateGuess(normalised, word);
    return res.json({ ok: true, result });
});
router.get("/valid-guesses", (_req, res) => {
    res.json({ ok: true, words: [...validGuesses] });
});
function evaluateGuess(guess, answer) {
    const result = Array(5).fill("wrong");
    const answerLetters = answer.split("");
    const guessLetters = guess.split("");
    // First pass: mark correct positions
    for (let i = 0; i < 5; i++) {
        if (guessLetters[i] === answerLetters[i]) {
            result[i] = "correct";
            answerLetters[i] = "";
            guessLetters[i] = "";
        }
    }
    // Second pass: mark misplaced letters
    for (let i = 0; i < 5; i++) {
        if (guessLetters[i] === "")
            continue;
        const idx = answerLetters.indexOf(guessLetters[i]);
        if (idx !== -1) {
            result[i] = "misplaced";
            answerLetters[idx] = "";
        }
    }
    return result;
}
export default router;
