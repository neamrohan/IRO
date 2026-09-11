import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bone: "#F7F3EC",
        ink: "#1C1815",
        oxblood: "#6E1F2B",
        oxbloodDark: "#4E151E",
        sand: "#C9B79C",
        moss: "#545B45",
        line: "#E4DCCB",
        cream: "#FBF9F4",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      maxWidth: { content: "1400px" },
    },
  },
  plugins: [],
};
export default config;
