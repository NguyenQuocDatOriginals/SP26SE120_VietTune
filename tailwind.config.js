/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#faf8f5",
          100: "#f0ebe3",
          200: "#e3d7c7",
          300: "#d1bca0",
          400: "#bfa178",
          500: "#a8805d",
          600: "#8b6f47",
          700: "#6d5639",
          800: "#584530",
          900: "#4a3a29",
        },
        secondary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
    },
  },
  plugins: [],
};
