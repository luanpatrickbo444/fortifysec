import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fortify: {
          dark: "#0a0a12",
          darker: "#05050a",
          purple: "#7c3aed",
          "purple-light": "#a78bfa",
          neon: "#c4f542",
          "neon-dim": "#a3d42e",
          card: "#12121f",
          border: "#1e1e2e",
          muted: "#94a3b8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(124, 58, 237, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 58, 237, 0.03) 1px, transparent 1px)",
        "glow-purple":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124, 58, 237, 0.25), transparent)",
        "glow-neon":
          "radial-gradient(ellipse 60% 40% at 80% 20%, rgba(196, 245, 66, 0.08), transparent)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        "glow-border": "glow-border 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "glow-border": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(196, 245, 66, 0.2)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
