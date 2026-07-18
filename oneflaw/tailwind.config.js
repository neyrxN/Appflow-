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
        // ── Graphite ────────────────────────────────────────────────
        // Premium iOS dark: black/charcoal surfaces, one warm accent,
        // green reserved for success, coral reserved for the reveal.
        void: { DEFAULT: "#08080A", 2: "#0E0E12" }, // app ground
        panel: { DEFAULT: "#151517", 2: "#1C1C20" }, // cards / elevated
        raised: "#28282E",
        line: "rgba(255,255,255,0.07)",
        line2: "rgba(255,255,255,0.12)",

        // Text ramp (near-white → grey).
        ice: "#F4F4F6",
        dim: "#9A9AA2",
        muted: "#6E6E76",
        faint: "#48484F",

        // Restrained accents.
        gold: "#E3C69A", // warm champagne accent
        cyan: "#5B8DEF", // soft blue whisper (secure / focus)
        iris: "#5B8DEF",
        good: "#34C759", // success / solved only
        warn: "#F5B547",
        flaw: "#F2705B", // muted coral — reveal severity only

        // Back-compat aliases for any legacy classes.
        accent: { DEFAULT: "#E3C69A", dark: "#D4B483" },
        ink: "#08080A",
      },
      fontFamily: {
        mono: ["SpaceMono"],
      },
    },
  },
  plugins: [],
};
