import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GameResultScreen from "../../../components/game/GameResult.tsx";

describe("GameResultScreen Component", () => {
    it("renders congratulations message when completed is true", () => {
        const mockResult = {
            id: "1",
            completed: true,
            score: 500,
        };

        render(<GameResultScreen result={mockResult as any} />);

        expect(screen.getByText("Congratulations!")).toBeInTheDocument();
        expect(screen.getByText("Score:")).toBeInTheDocument();
        expect(screen.getByText("500")).toBeInTheDocument();
    });

    it("renders alternative message when completed is false", () => {
        const mockResult = {
            id: "1",
            completed: false,
            score: 0,
        };

        render(<GameResultScreen result={mockResult as any} />);

        expect(
            screen.getByText("Next time will be better"),
        ).toBeInTheDocument();
        expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("renders additional statistics if provided", () => {
        const mockResult = {
            id: "1",
            completed: true,
            score: 1000,
            attempts_used: 4,
            correct_answers: 5,
            time_seconds: 60,
        };

        render(<GameResultScreen result={mockResult as any} />);

        expect(screen.getByText("4")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("60s")).toBeInTheDocument();
    });
});
