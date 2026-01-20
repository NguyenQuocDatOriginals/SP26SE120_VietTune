/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary: Đỏ nâu đậm (Deep Burgundy Red) - như trong hình
        primary: {
          50: "#fef2f2",
          100: "#fde8e8",
          200: "#fbd5d5",
          300: "#f8b4b4",
          400: "#e57373",
          500: "#c62828",
          600: "#9B2C2C",
          700: "#7f1d1d",
          800: "#6b1818",
          900: "#4a1010",
        },
        // Secondary: Vàng cờ Việt Nam (Vietnamese Flag Yellow/Gold)
        secondary: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        // Neutral colors for text and backgrounds
        neutral: {
          50: "#FFF2D6",
          100: "#FFECC4",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
        // Cream background
        cream: {
          50: "#FFF7E6",
          100: "#FFF2D6",
          200: "#FFECC4",
        },
      },
    },
  },
  plugins: [],
};
