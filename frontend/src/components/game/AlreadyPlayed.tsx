import { GameResult } from '../../types/game.types';

interface Props {
  result: GameResult;
}
const AlreadyPlayed = ({ result }: Props) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-gray-200/30 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
        <h2 className="text-2xl font-bold text-black">You already played today!</h2>
        <div className="flex flex-col items-center gap-2 text-lg text-black">
          <p>Score: <span className="font-semibold">{result.score}</span></p>
          {result.attempts_used && <p>Attempts: <span className="font-semibold">{result.attempts_used}</span></p>}
          {result.correct_answers && <p>Correct answers: <span className="font-semibold">{result.correct_answers}</span></p>}
          {result.time_seconds && <p>Time: <span className="font-semibold">{result.time_seconds}s</span></p>}
        </div>
        <p className="text-sm text-black">You can still play other games today!</p>
        <button
          onClick={() => window.location.href = '/'}
          className="mt-4 px-6 py-2 rounded-xl font-semibold transition text-white"
          style={{ backgroundColor: '#3377f2' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#5b93f5')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#3377f2')}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default AlreadyPlayed;