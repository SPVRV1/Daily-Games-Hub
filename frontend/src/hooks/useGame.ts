import { useState, useEffect } from 'react';
import { GameType, GameChallenge, GameResult, GameState } from '../types/game.types';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type GameQueryParams = Record<string, string>;

export const useGame = (gameType: GameType, queryParams?: GameQueryParams) => {
    const [state, setState] = useState<GameState>({
        status: 'loading',
        challenge: null,
        result: null,
    });

    const queryString = queryParams ? `?${new URLSearchParams(queryParams).toString()}` : '';

    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const playedRes = await fetch(`${API}/api/games/${gameType}/played-today${queryString}`, { headers });
            const playedData = await playedRes.json();

            if (playedData.played) {
                setState({ status: 'already_played', challenge: null, result: playedData.result });
                return;
            }

            const challengeRes = await fetch(`${API}/api/games/${gameType}/today${queryString}`, { headers });
            const challenge: GameChallenge = await challengeRes.json();

            setState({ status: 'playing', challenge, result: null });
        };

        init();
    }, [gameType, queryString]);

    const submitResult = async (result: GameResult) => {
        const token = localStorage.getItem('token');

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