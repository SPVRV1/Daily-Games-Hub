import { Link } from 'react-router-dom';
import { GameResult } from '../../types/game.types';

interface Props {
    result: GameResult;
}

const GameResultScreen = ({ result }: Props) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-6">
            <div className="w-full max-w-md rounded-2xl bg-white/80 text-black shadow-xl backdrop-blur-md">
                <div className="flex flex-col items-center gap-4 p-8">
                    <h2 className="text-3xl font-bold">
                        {result.completed ? 'Congratulations!' : 'Next time will be better'}
                    </h2>
                    <div className="flex flex-col items-center gap-2 text-lg">
                        <p>Score: <span className="font-semibold">{result.score}</span></p>
                        {typeof result.attempts_used === "number" && result.attempts_used > 0 && (
                            <p>Attempts: <span className="font-semibold">{result.attempts_used}</span></p>
                        )}
                        {typeof result.correct_answers === "number" && result.correct_answers > 0 && (
                            <p>Correct answers: <span className="font-semibold">{result.correct_answers}</span></p>
                        )}
                        {typeof result.time_seconds === "number" && result.time_seconds > 0 && (
                            <p>Time: <span className="font-semibold">{result.time_seconds}s</span></p>
                        )}
                    </div>
                    <Link to="/" className="mt-2 rounded-lg bg-black px-4 py-2 text-white">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default GameResultScreen;