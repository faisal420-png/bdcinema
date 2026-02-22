import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                surface: {
                    DEFAULT: "#000000",
                    100: "#0a0a0a",
                    200: "#121212",
                    300: "#1a1a1a",
                    400: "#242424",
                },
                "neon-cyan": "#00f5ff",
                "neon-pink": "#ff2d78",
                "neon-green": "#39ff14",
                "neon-red": "#ff003c",
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            borderRadius: {
                xl: "1rem",
                "2xl": "1.25rem",
            },
            transitionTimingFunction: {
                'cinematic': 'cubic-bezier(0.19, 1, 0.22, 1)',
            },
            animation: {
                "fade-in": "fadeIn 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards",
                "fade-up": "fadeUp 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards",
                "slide-in": "slideIn 0.4s cubic-bezier(0.19, 1, 0.22, 1) forwards",
                shimmer: "shimmer 2s infinite",
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
                fadeUp: {
                    from: { opacity: "0", transform: "translateY(30px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                slideIn: {
                    from: { opacity: "0", transform: "translateX(-20px)" },
                    to: { opacity: "1", transform: "translateX(0)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
