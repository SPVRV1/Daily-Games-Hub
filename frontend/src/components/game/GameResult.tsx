import { GameResult } from '../../types/game.types';

interface Props {
    result: GameResult;
}

const GameResultScreen = ({ result }: Props) => {
    return (
        <div className="flex flex-col items-center gap-4 p-8">
            <h2 className="text-3xl font-bold">
                {result.completed ? 'Congratulations!' : 'Next time will be better'}
            </h2>
            <div className="flex flex-col items-center gap-2 text-lg">
                <p>Score: <span className="font-semibold">{result.score}</span></p>
                {result.attempts_used && <p>Attempts: <span className="font-semibold">{result.attempts_used}</span></p>}
                {result.correct_answers && <p>Correct answers: <span className="font-semibold">{result.correct_answers}</span></p>}
                {result.time_seconds && <p>Time: <span className="font-semibold">{result.time_seconds}s</span></p>}
            </div>
        </div>
    );
};

export default GameResultScreen;