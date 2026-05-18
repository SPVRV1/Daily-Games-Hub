import Navbar from "../components/Navbar";
import GamePage from "../components/game/GamePage";
import Wordle from "../components/game/Wordle";

export default function WordlePage() {
    return (
        <>
            <Navbar activeLink="home" />

            <GamePage
                gameType="wordle"
                renderGame={(challenge, onFinish) => (
                    <Wordle data={challenge} onFinish={onFinish} />
                )}
            />
        </>
    );
}