import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        online: "#10b981", // emerald
        offline: "#f43f5e", // rose
        neonGreen: "#00ffcc",
        deepSpace: "#0a0f16",
        hologramBlue: "#00bfff",
        glitchRed: "#ff003c",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "Fira Code", "monospace"],
        shareTech: ["Share Tech Mono", "monospace"],
      },
      animation: {
        "slow-pulse": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
