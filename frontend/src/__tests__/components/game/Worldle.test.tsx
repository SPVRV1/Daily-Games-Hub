import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Worldle from "../../../components/game/Worldle";
import {
    bearing,
    countryCoords,
    haversineDistance,
} from "../../../data/countryCoords";

describe("Worldle component", () => {
    beforeEach(() => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                json: vi.fn().mockResolvedValue([
                    { name: "Slovenia", code: "si" },
                    { name: "Germany", code: "de" },
                ]),
            }),
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("renders real distance feedback for a wrong guess", async () => {
        const onFinish = vi.fn();

        render(
            <MemoryRouter>
                <Worldle
                    data={{
                        date: "18-05-2026",
                        challengeData: {
                            answer: "Slovenia",
                            validCountries: ["Slovenia", "Germany"],
                            silhouette: "M0 0 L1 1 Z",
                        },
                    }}
                    onFinish={onFinish}
                />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(
                screen.getByPlaceholderText("Guess the country..."),
            ).toBeInTheDocument();
        });

        fireEvent.change(screen.getByPlaceholderText("Guess the country..."), {
            target: { value: "Germany" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Answer" }));

        const guessCoords = countryCoords.de;
        const targetCoords = countryCoords.si;
        const distance = haversineDistance(
            guessCoords[0],
            guessCoords[1],
            targetCoords[0],
            targetCoords[1],
        );
        const direction = bearing(
            guessCoords[0],
            guessCoords[1],
            targetCoords[0],
            targetCoords[1],
        );

        expect(
            await screen.findByText(
                `${distance.toLocaleString()} km ${direction}`,
            ),
        ).toBeInTheDocument();
        expect(onFinish).not.toHaveBeenCalled();
    });
});
