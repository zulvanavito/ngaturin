import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-work-sans)", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        brand: {
          green: "#9fe870",
          dark: "#0e0f0c",
          mint: "#e2f6d5",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontSize: {
        "mega": ["clamp(3.5rem, 12vw, 7.88rem)", { lineHeight: "0.85", fontWeight: "900", letterSpacing: "-0.02em" }],
        "hero": ["clamp(2.5rem, 8vw, 6rem)", { lineHeight: "0.85", fontWeight: "900", letterSpacing: "-0.02em" }],
        "display": ["4rem", { lineHeight: "0.85", fontWeight: "900" }],
        "heading": ["2.5rem", { lineHeight: "0.85", fontWeight: "900" }],
        "title": ["1.62rem", { lineHeight: "1.23", fontWeight: "600" }],
        "body": ["1.13rem", { lineHeight: "1.44", fontWeight: "400" }],
        "body-bold": ["1.13rem", { lineHeight: "1.44", fontWeight: "600" }],
      },
      borderRadius: {
        pill: "9999px",
        mega: "1000px",
        section: "40px",
        large: "30px",
        medium: "20px",
        card: "16px",
        input: "10px",
        sm: "2px",
      },
      boxShadow: {
        ring: "rgba(14,15,12,0.12) 0px 0px 0px 1px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
