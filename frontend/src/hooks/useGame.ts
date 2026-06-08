import { useState, useEffect } from 'react';
import { GameType, GameChallenge, GameResult, GameState } from '../types/game.types';

const API = import.meta.env.VITE_API_URL ?? "";

type GameQueryParams = Record<string, string>;

export const useGame = (gameType: GameType, queryParams?: GameQueryParams) => {
    const [state, setState] = useState<GameState>({
        status: 'loading',
        challenge: null,
        result: null,
    });

    const queryString = queryParams ? `?${new URLSearchParams(queryParams).toString()}` : '';

    useEffect(() => {
        let cancelled = false;

        const init = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

                if (headers) {
                    const playedRes = await fetch(`${API}/api/games/${gameType}/played-today${queryString}`, { headers });
                    if (playedRes.status === 401) {
                        localStorage.removeItem('token');
                    }
                    else if (playedRes.ok === false) {
                        throw new Error("Could not check today's play status");
                    }

                    if (playedRes.status !== 401) {
                        const playedData = await playedRes.json();

                        if (playedData.played) {
                            if (!cancelled) {
                                setState({ status: 'already_played', challenge: null, result: playedData.result });
                            }
                            return;
                        }
                    }
                }

                const challengeRes = await fetch(`${API}/api/games/${gameType}/today${queryString}`, { headers });
                if (challengeRes.ok === false) {
                    throw new Error("Could not load today's challenge");
                }

                const challenge: GameChallenge = await challengeRes.json();

                if (!cancelled) {
                    setState({ status: 'playing', challenge, result: null });
                }
            }
            catch (error) {
                if (!cancelled) {
                    setState({
                        status: 'error',
                        challenge: null,
                        result: null,
                        error: error instanceof Error ? error.message : 'Could not load game',
                    });
                }
            }
        };

        init();

        return () => {
            cancelled = true;
        };
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
