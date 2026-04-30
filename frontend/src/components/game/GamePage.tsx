import React from 'react';
import { GameType, GameChallenge, GameResult } from '../../types/game.types';
import { useGame } from '../../hooks/useGame';
import GameResultScreen from './GameResult';
import AlreadyPlayed from './AlreadyPlayed';

interface GamePageProps {
    gameType: GameType;
    renderGame: (challenge: GameChallenge, onFinish: (result: GameResult) => void) => React.ReactNode;
}
// Wrapper around every game, which is in one of 3 states: loading, already played => (showes reuslts) and finised
const GamePage = ({ gameType, renderGame } :GamePageProps) => {
    const { state, submitResult } = useGame(gameType);

    if (state.status === 'loading') return <div>Loading...</div>;

    if (state.status === 'already_played') return <AlreadyPlayed result={state.result!} />;

    if (state.status === 'finished') return <GameResultScreen result={state.result!} />;

    return <>{renderGame(state.challenge!, submitResult)}</>;
};

export default GamePage;


/*
EXAMPLE FOR USAGE WORDLE

const WordlePage = () => (
  <GamePage
    gameType="wordle"
    renderGame={(challenge, onFinish) => (
      <WordleGame
        data={challenge.challengeData}
        onFinish={onFinish}
      />
    )}
  />
);

*/