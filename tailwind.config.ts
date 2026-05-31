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
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#454745',
            '--tw-prose-headings': '#0e0f0c',
            '--tw-prose-links': '#0e0f0c',
            '--tw-prose-bold': '#0e0f0c',
            '--tw-prose-quotes': '#454745',
            '--tw-prose-quote-borders': '#9fe870',
            maxWidth: 'none',
            fontFeatureSettings: '"calt" 1',
            lineHeight: '1.8',
            fontSize: '18px',
            h1: {
              fontWeight: '900',
              letterSpacing: '-0.02em',
              lineHeight: '1.1',
              fontFamily: 'Wise Sans, var(--font-work-sans), sans-serif',
            },
            h2: {
              fontWeight: '800',
              letterSpacing: '-0.02em',
              lineHeight: '1.15',
              fontFamily: 'Wise Sans, var(--font-work-sans), sans-serif',
              marginTop: '2.5em',
            },
            h3: {
              fontWeight: '800',
              letterSpacing: '-0.01em',
              lineHeight: '1.2',
              fontFamily: 'Wise Sans, var(--font-work-sans), sans-serif',
              marginTop: '2em',
            },
            h4: {
              fontWeight: '700',
              lineHeight: '1.3',
            },
            a: {
              fontWeight: '700',
              textDecorationColor: '#9fe870',
              textDecorationThickness: '3px',
              textUnderlineOffset: '4px',
              '&:hover': {
                textDecorationColor: '#0e0f0c',
              },
            },
            img: {
              borderRadius: '2rem',
              boxShadow: '0 20px 50px rgba(14, 15, 12, 0.08)',
            },
            blockquote: {
              borderLeftWidth: '6px',
              borderLeftColor: '#9fe870',
              backgroundColor: 'rgba(159, 232, 112, 0.05)',
              borderRadius: '0 1rem 1rem 0',
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem',
              paddingRight: '1.5rem',
              fontWeight: '500',
              fontStyle: 'italic',
            },
            code: {
              fontWeight: '600',
              backgroundColor: '#f9faf9',
              padding: '0.15em 0.4em',
              borderRadius: '0.375rem',
              border: '1px solid rgba(14, 15, 12, 0.08)',
              '&::before': { content: 'none' },
              '&::after': { content: 'none' },
            },
            pre: {
              borderRadius: '1.5rem',
              backgroundColor: '#1a1b18',
            },
            hr: {
              borderColor: 'rgba(14, 15, 12, 0.08)',
              marginTop: '3em',
              marginBottom: '3em',
            },
            table: {
              borderRadius: '1rem',
              overflow: 'hidden',
            },
            th: {
              fontWeight: '800',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              backgroundColor: 'rgba(159, 232, 112, 0.1)',
            },
            td: {
              fontSize: '0.9375rem',
            },
          },
        },
        invert: {
          css: {
            '--tw-prose-body': '#d1d5d0',
            '--tw-prose-headings': '#e8ebe6',
            '--tw-prose-links': '#e8ebe6',
            '--tw-prose-bold': '#e8ebe6',
            '--tw-prose-quotes': '#a8aba6',
            '--tw-prose-quote-borders': '#9fe870',
            code: {
              backgroundColor: '#1a1b18',
              borderColor: 'rgba(232, 235, 230, 0.1)',
              color: '#e8ebe6',
            },
            blockquote: {
              backgroundColor: 'rgba(159, 232, 112, 0.08)',
            },
            th: {
              backgroundColor: 'rgba(159, 232, 112, 0.15)',
            },
            a: {
              '&:hover': {
                textDecorationColor: '#e8ebe6',
              },
            },
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
