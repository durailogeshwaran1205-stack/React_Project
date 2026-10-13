/** Tailwind v3 config (works with Create React App's built-in PostCSS support) */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: { 950: "#070C24", 900: "#0B1230", 800: "#121B45", 700: "#1B2760" },
        electric: { DEFAULT: "#5B5BFF", 600: "#4646E6" },
        mist: "#7FE7F5",
      },
      fontFamily: { sans: ["Manrope", "system-ui", "Segoe UI", "Roboto", "sans-serif"] },
    },
  },
  plugins: [],
};
