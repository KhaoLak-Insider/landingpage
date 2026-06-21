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
          DEFAULT: "#14b8a6",
          light: "#99f6e4",
          dark: "#0d9488",
        },

        background: "#ffffff",
        surface: "#f8fafc",

        text: {
          DEFAULT: "#0f172a",
          muted: "#64748b",
          soft: "#94a3b8",
        },

        border: "rgba(0,0,0,0.06)",

        success: {
          light: "#d1fae5",
          DEFAULT: "#10b981",
          dark: "#059669",
        },

        error: {
          light: "#fee2e2",
          DEFAULT: "#ef4444",
          dark: "#dc2626",
        },
      },

      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
      },

      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.08)",
        card: "0 8px 20px rgba(0,0,0,0.06)",
        hover: "0 15px 40px rgba(0,0,0,0.12)",
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