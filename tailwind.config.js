/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0d0d0d",
        contract: "#9333ea", // Purple
        stateVar: "#2563eb", // Blue
        func: "#eab308",    // Yellow
        modifier: "#ea580c", // Orange
        event: "#16a34a",    // Green
        constructor: "#dc2626", // Red
      },
    },
  },
  plugins: [],
}
