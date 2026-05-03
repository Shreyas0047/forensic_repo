/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08111f",
        panel: "#0f172a",
        accent: "#22c55e",
        warn: "#f59e0b",
        danger: "#ef4444",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(148,163,184,0.12), 0 12px 30px rgba(15,23,42,0.45)",
      },
    },
  },
  plugins: [],
};
