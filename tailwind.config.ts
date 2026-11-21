import type { Config } from "tailwindcss";

// RUPAARI design system 01.0: hex values are fixed.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        burgundy: "#680F1A", // color/burgundy-700
        wine: "#4A0B13", // color/wine-900
        gold: "#C9A24D", // color/gold-500
        ivory: "#F7F1E7", // color/ivory-50
        taupe: "#BBA99A", // color/taupe-400
        ink: "#1C1A1A", // color/black-950
      },
      fontFamily: {
        // Trajan Pro primary (licensed, used if installed), Cinzel designated fallback
        display: ['"Trajan Pro"', '"Trajan Pro 3"', "var(--font-cinzel)", '"Times New Roman"', "serif"],
        sans: ["var(--font-montserrat)", "system-ui", "-apple-system", '"Segoe UI"', "Roboto", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
