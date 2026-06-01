import Navbar from "../components/Navbar";
import GamePage from "../components/game/GamePage";
import MoreLess from "../components/game/MoreLess";

export default function MoreLessPage() {
    return (
        <>
            <Navbar activeLink="home" />

            <GamePage
                gameType="moreless"
                renderGame={(challenge, onFinish) => (
                    <MoreLess data={challenge} onFinish={onFinish} />
                )}
            />
        </>
    );
}