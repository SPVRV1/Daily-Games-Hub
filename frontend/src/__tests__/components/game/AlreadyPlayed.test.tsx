import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AlreadyPlayed from "../../../components/game/AlreadyPlayed.tsx";

const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...(actual as any),
        useNavigate: () => mockedNavigate,
    };
});

describe("AlreadyPlayed Component", () => {
    it("renders the already played message and score", () => {
        const mockResult = {
            id: "1",
            score: 100,
            attempts_used: 5,
            correct_answers: 10,
            time_seconds: 120,
        };

        render(
            <MemoryRouter>
                <AlreadyPlayed result={mockResult as any} />
            </MemoryRouter>,
        );

        expect(
            screen.getByText("You already played today!"),
        ).toBeInTheDocument();
        expect(screen.getByText("100")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByText("120s")).toBeInTheDocument();
    });

    it("navigates home when Go to Home button is clicked", () => {
        const mockResult = {
            id: "1",
            score: 50,
        };

        render(
            <MemoryRouter>
                <AlreadyPlayed result={mockResult as any} />
            </MemoryRouter>,
        );

        const btn = screen.getByRole("button", { name: "Go to Home" });
        fireEvent.click(btn);

        expect(mockedNavigate).toHaveBeenCalledWith("/");
    });
});
