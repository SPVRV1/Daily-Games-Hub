export interface Game {
    game_id: number;
    name: string;
    description?: string;
    puzzle_table: string;
    max_attempts?: number | null;
    time_limit_seconds?: number | null;
    is_active: boolean;
}