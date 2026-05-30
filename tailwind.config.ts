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
        sans: ["Wise Sans", "var(--font-inter)", "sans-serif"],
        display: ["Wise Sans", "var(--font-work-sans)", "sans-serif"],
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
          pastel: "#cdffad",
          darkGreen: "#163300",
          orange: "#ffc091",
          cyan: "rgba(56, 200, 255, 0.10)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        income: "hsl(var(--income))",
        expense: "hsl(var(--expense))",
        piutang: "hsl(var(--piutang))",
        success: "hsl(var(--success))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
          "6": "hsl(var(--chart-6))",
        },
      },
      fontSize: {
        "display-mega": ["126px", { lineHeight: "0.85", fontWeight: "900" }],
        "display-hero": ["96px", { lineHeight: "0.85", fontWeight: "900" }],
        "heading-section": ["64px", { lineHeight: "0.85", fontWeight: "900" }],
        "heading-sub": ["40px", { lineHeight: "0.85", fontWeight: "900" }],
        "heading-alt": ["78px", { lineHeight: "1.10", fontWeight: "600", letterSpacing: "-2.34px" }],
        "body-md": ["18px", { lineHeight: "1.44", fontWeight: "400", letterSpacing: "0.18px" }],
        "body-semibold": ["18px", { lineHeight: "1.44", fontWeight: "600", letterSpacing: "-0.108px" }],
        "label-sm": ["12px", { lineHeight: "1.5", fontWeight: "600" }],
      },
      boxShadow: {
        ring: "rgba(14, 15, 12, 0.12) 0px 0px 0px 1px",
      },
      borderRadius: {
        cardSm: "16px",
        cardMd: "30px",
        cardLg: "40px",
        pill: "9999px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
