import type { ReactNode } from "react";
import { useTheme } from "../context/ThemeContext";

type LoadingOverlayProps = {
    isLoading: boolean;
    children: ReactNode;
};

const LoadingOverlay = ({ isLoading, children }: LoadingOverlayProps) => {
    const { isDark } = useTheme();

    return (
        <div className="relative flex-1">
            <div
                style={{
                    filter: isLoading ? "blur(8px)" : "none",
                    opacity: isLoading ? 0.5 : 1,
                    transition: "filter 0.3s ease, opacity 1.3s ease",
                    pointerEvents: isLoading ? "none" : "auto",
                    userSelect: isLoading ? "none" : "auto",
                }}
            >
                {children}
            </div>

            <div
                className="fixed inset-0 z-50 flex items-center justify-center px-4 transition-opacity duration-300"
                style={{ opacity: isLoading ? 1 : 0, pointerEvents: isLoading ? "auto" : "none" }}
                aria-live="polite"
                aria-busy={isLoading}
            >

            </div>
        </div>
    );
};

export default LoadingOverlay;
