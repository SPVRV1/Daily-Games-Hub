import Navbar from "../components/Navbar";
import GamePage from "../components/game/GamePage";
import Worldle from "../components/game/Worldle";

export default function WorldlePage() {
    return (
        <>
            <Navbar />

            <GamePage
                gameType="worldle"
                renderGame={(challenge, onFinish) => (
                    <Worldle
                        data={challenge}
                        onFinish={onFinish}
                    />
                )}
            />
        </>
    );
}