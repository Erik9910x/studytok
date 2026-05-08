import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        appleBlue: "#0071E3",
        graphite: "#1D1D1F",
        porcelain: "#F5F5F7",
        mist: "#E8EEF8",
        lavenderMist: "#EEE9FF",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(29, 29, 31, 0.10)",
        glass: "0 18px 45px rgba(0, 0, 0, 0.08)",
      },
      fontFamily: {
        display: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
