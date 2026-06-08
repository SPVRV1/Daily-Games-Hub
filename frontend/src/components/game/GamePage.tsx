import React, { useEffect, useRef } from "react";
import { GameType, GameChallenge, GameResult } from "../../types/game.types";
import { useGame } from "../../hooks/useGame";
import GameResultScreen from "./GameResult";
import AlreadyPlayed from "./AlreadyPlayed";

const API = import.meta.env.VITE_API_URL ?? "";

const GAME_TITLES: Record<string, string> = {
  flagle: "Flagle",
  wordle: "Wordle",
  worldle: "Worldle",
  moreless: "More or Less",
  mathsprint: "Math Sprint",
  songless: "Songless",
};

function saveGameToProfile(gameType: string, result: GameResult) {
  const token = localStorage.getItem("token");
  if (!token) return;
  fetch(`${API}/api/user/data/game`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title: GAME_TITLES[gameType] ?? gameType,
      attempts: result.attempts_used ?? 0,
      timeTaken: result.time_seconds ?? 0,
      completed: result.completed,
    }),
  }).catch(() => { });
}

interface GamePageProps {
  gameType: GameType;
  challengeQueryParams?: Record<string, string>;
  renderGame: (
    challenge: GameChallenge,
    onFinish: (result: GameResult) => void,
  ) => React.ReactNode;
}
// Wrapper around every game, which is in one of 3 states: loading, already played => (showes reuslts) and finised
const GamePage = ({
  gameType,
  challengeQueryParams,
  renderGame,
}: GamePageProps) => {
  const { state, submitResult } = useGame(gameType, challengeQueryParams);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (state.status === "playing") {
      hasSubmittedRef.current = false;
    }
  }, [state.status]);

  // Backfill: if the game was already played today (before saveGameToProfile existed),
  // save it now. The backend dedup check prevents double entries.
  useEffect(() => {
    if (state.status === "already_played" && state.result && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      saveGameToProfile(gameType, state.result);
    }
  }, [state.status, gameType]);

  const handleFinish = (result: GameResult) => {
    if (hasSubmittedRef.current) {
      return;
    }
    hasSubmittedRef.current = true;
    saveGameToProfile(gameType, result);
    submitResult(result);
  };

  if (state.status === "loading") {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", gap: "12px" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #e5e7eb", borderTopColor: "#6b7280", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <span style={{ fontSize: 14, color: "#6b7280" }}>Loading...</span>
    </div>;
  }
  if (state.status === "error") return <div>{state.error ?? "Could not load game."}</div>;

  // Full-page end screens — game is not rendered, preventing replays
  if (state.status === "already_played") {
    return <AlreadyPlayed result={state.result!} />;
  }
  if (state.status === "finished") {
    return <GameResultScreen result={state.result!} />;
  }

  return (
    <>
      {state.challenge ? renderGame(state.challenge, handleFinish) : null}
    </>
  );
};

export default GamePage;

/*
WHAT HAPPENS BEHIND THE SCENES:

1. GamePage handles loading state
   - Fetches daily challenge for the game type

2. Checks if user already played today
   - If YES: show AlreadyPlayed modal with previous results
   - If NO: display the game

3. When game finishes:
   - Game calls onFinish(result)
   - GamePage sends results to backend
   - Display GameResultScreen with results

ResultObject is defined in /types

EXAMPLE FOR WORDLE:
const WordleGame = ({ data, onFinish }) => {
  
  const handleGameEnd = (isWon, attempts, timeSpent) => {
    onFinish({
      score: isWon ? 100 : 50,
      attempts_used: attempts,
      correct_answers: 1,
      time_seconds: timeSpent
    });
  };
  
  return <div>Play Wordle...</div>;
}*/
