import React from "react";
import { GameType, GameChallenge, GameResult } from "../../types/game.types";
import { useGame } from "../../hooks/useGame";
import GameResultScreen from "./GameResult";
import AlreadyPlayed from "./AlreadyPlayed";

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

  if (state.status === "loading") return <div>Loading...</div>;

  if (state.status === "already_played")
    return <AlreadyPlayed result={state.result!} />;

  if (state.status === "finished")
    return <GameResultScreen result={state.result!} />;

  return <>{renderGame(state.challenge!, submitResult)}</>;
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
