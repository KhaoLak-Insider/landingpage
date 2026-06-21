import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#14b8a6", // teal-500 (HAUPTFARBE)
          dark: "#0d9488",    // hover / active
          light: "#99f6e4",   // highlights
        },

        background: "#ffffff",
        surface: "#f8fafc",

        text: {
          DEFAULT: "#0f172a",
          muted: "#475569",
          soft: "#64748b",
          light: "#94a3b8",
        },

        border: "#e2e8f0",

        shadow: "rgba(0,0,0,0.08)",
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.08)",
        card: "0 8px 20px rgba(0,0,0,0.06)",
        glow: "0 10px 25px rgba(20, 184, 166, 0.25)",
      },

      borderRadius: {
        xl: "12px",
        "2xl": "18px",
        "3xl": "28px",
        full: "999px",
      },
    },
  },

  plugins: [],
};

export default config;