import { GameResult } from "../../types/game.types";
import GameEndScreen from "./GameEndScreen";

interface Props {
    result: GameResult;
}

// Shows the consistent end screen when the user already played today.
// GamePage sets challenge=null in this state so the game below is never rendered.
export default function AlreadyPlayed({ result }: Props) {
    return <GameEndScreen result={result} alreadyPlayed />;
}
