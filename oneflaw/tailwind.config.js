/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./puzzles/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Single accent — confident "hacker" green.
        accent: {
          DEFAULT: "#22e07a",
          dark: "#12b862",
        },
        ink: "#0b0f14", // near-black used by the reveal card
      },
      fontFamily: {
        mono: ["SpaceMono"],
      },
    },
  },
  plugins: [],
};
