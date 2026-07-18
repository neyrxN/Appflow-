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
        // ── Obsidian Signal ─────────────────────────────────────────
        // Grounds: obsidian black with a faint blue bias.
        void: { DEFAULT: "#06070B", 2: "#090B12" },
        panel: { DEFAULT: "#0F131C", 2: "#141926" },
        raised: "#1B2233",
        line: "rgba(150,170,210,0.10)",
        line2: "rgba(150,170,210,0.16)",

        // Cool-white text ramp (blue-biased neutrals, chosen not defaulted).
        ice: "#EAF0FA",
        dim: "#AEB8CC",
        muted: "#7C879C",
        faint: "#545E72",

        // Cool = the intact system.
        cyan: "#31E7DE",
        iris: "#7C6BFF",

        // Hot = the flaw you expose (used sparingly).
        flaw: "#FF3552",
        ember: "#FF7A45",

        // Semantic (separate from the accent hues).
        good: "#33D69F",
        warn: "#F5B547",

        // Back-compat aliases so legacy `accent` / `ink` classes recolor.
        accent: { DEFAULT: "#31E7DE", dark: "#19B8C6" },
        ink: "#06070B",
      },
      fontFamily: {
        mono: ["SpaceMono"],
      },
    },
  },
  plugins: [],
};
