import { useState, useEffect } from 'react';
import { GameType, GameChallenge, GameResult, GameState } from '../types/game.types';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const useGame = (gameType: GameType) => {
    const [state, setState] = useState<GameState>({
        status: 'loading',
        challenge: null,
        result: null,
    });

    useEffect(() => {
        const init = async () => {
            // if JWT is saved in localStorage
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // does not yet work JWT not implemented
            const playedRes = await fetch(`${API}/api/games/${gameType}/played-today`, { headers });
            const playedData = await playedRes.json();

            if (playedData.played) {
                setState({ status: 'already_played', challenge: null, result: playedData.result });
                return;
            }

            const challengeRes = await fetch(`${API}/api/games/${gameType}/today`, { headers });
            const challenge: GameChallenge = await challengeRes.json();

            setState({ status: 'playing', challenge, result: null });
        };

        init();
    }, [gameType]);

    const submitResult = async (result: GameResult) => {
        // if JWT is saved in localStorage
        const token = localStorage.getItem('token');

        // does not yet work JWT not implemented
        await fetch(`${API}/api/games/${gameType}/result`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(result),
        });

        setState((prev) => ({ ...prev, status: 'finished', result }));
    };

    return { state, submitResult };
};