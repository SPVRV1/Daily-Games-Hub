import { useNavigate } from 'react-router-dom';
import { GameResult } from '../../types/game.types';

interface Props {
  result: GameResult;
}

// displays user result over the page contents
const AlreadyPlayed = ({ result }: Props) => {

  const navigate = useNavigate()
  const hangleGoHome = () => navigate("/")

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-gray-200/30 rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-4 shadow-2xl w-full max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold text-black text-center">
          You already played today!
        </h2>
        <div className="flex flex-col items-center gap-2 text-base sm:text-lg text-black w-full">
          <p>
            Score: <span className="font-semibold">{result.score}</span>
          </p>
          {result.attempts_used && (
            <p>
              Attempts: <span className="font-semibold">{result.attempts_used}</span>
            </p>
          )}
          {result.correct_answers && (
            <p>
              Correct answers: <span className="font-semibold">{result.correct_answers}</span>
            </p>
          )}
          {result.time_seconds && (
            <p>
              Time: <span className="font-semibold">{result.time_seconds}s</span>
            </p>
          )}
        </div>
        <p className="text-sm text-black text-center">
          You can still play other games today!
        </p>
        <button
          onClick={hangleGoHome}
          className="mt-4 px-6 py-2 rounded-xl font-semibold transition bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default AlreadyPlayed;