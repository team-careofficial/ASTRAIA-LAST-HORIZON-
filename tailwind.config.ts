import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { g0: "#08090b", g1: "#101114", g2: "#17181c", amber: "#e8a45a", mars: "#c8552b", tech: "#9bb8d4", ink: "#ece8df", mute: "#8f8c85" },
    fontFamily: { display: ["var(--font-display)", "sans-serif"], data: ["var(--font-mono)", "monospace"], ui: ["var(--font-ui)", "sans-serif"] } } },
  plugins: [],
};
export default config;
