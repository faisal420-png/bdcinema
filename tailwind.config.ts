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
                    DEFAULT: "#050510",
                    100: "#0a0a1a",
                    200: "#0f0f24",
                    300: "#16163a",
                    400: "#1e1e4a",
                },
                amethyst: {
                    DEFAULT: "#8B5CF6",
                    light: "#A78BFA",
                    dark: "#6D28D9",
                    glow: "rgba(139, 92, 246, 0.3)",
                },
                teal: {
                    DEFAULT: "#14B8A6",
                    light: "#5EEAD4",
                    dark: "#0D9488",
                },
                rose: {
                    DEFAULT: "#F43F5E",
                    light: "#FB7185",
                    dark: "#E11D48",
                },
                midnight: "#050510",
                // Legacy compatibility
                "neon-cyan": "#5EEAD4",
                "neon-pink": "#F43F5E",
                "neon-green": "#39ff14",
                "neon-red": "#ff003c",
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
            },
            borderRadius: {
                xl: "1rem",
                "2xl": "1.25rem",
                "3xl": "1.5rem",
                "4xl": "2rem",
            },
            transitionTimingFunction: {
                'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                'cinematic': 'cubic-bezier(0.19, 1, 0.22, 1)',
                'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
            backdropBlur: {
                'glass': '40px',
                'heavy': '80px',
            },
            animation: {
                "fade-in": "fadeIn 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards",
                "fade-up": "fadeUp 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards",
                "slide-up-spring": "slideUpSpring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                "elastic-pop": "elasticPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                "pulse-glow": "pulseGlow 3s ease-in-out infinite",
                shimmer: "shimmer 2s infinite",
                "mesh-float": "meshFloat 20s ease-in-out infinite alternate",
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
                slideUpSpring: {
                    "0%": { opacity: "0", transform: "translateY(30px)" },
                    "60%": { transform: "translateY(-5px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                elasticPop: {
                    "0%": { transform: "scale(0.8)", opacity: "0" },
                    "50%": { transform: "scale(1.05)" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
                pulseGlow: {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(139, 92, 246, 0.2)" },
                    "50%": { boxShadow: "0 0 40px rgba(139, 92, 246, 0.4)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                meshFloat: {
                    "0%": { transform: "translate(0, 0) scale(1)" },
                    "33%": { transform: "translate(30px, -20px) scale(1.1)" },
                    "66%": { transform: "translate(-20px, 15px) scale(0.95)" },
                    "100%": { transform: "translate(10px, -10px) scale(1.05)" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
