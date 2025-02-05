/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        orange: {
          DEFAULT: "#FF8019",
          light: "#FF8F29",
          ultra_light: "#FFF0E6",
          hover: "#cc6614"
        },
        status: {
          success_light: "#E0F5E9",
          success: "#4B946B",
          draft_light: "#E6FFE6",
          draft: "#68AF68",
          planning_light: "#FFE4DC",
          planning: "#D75A34",
          research_light: "#E1F3FB",
          research: "#5CA4C3",
          review_light: "#F8E6F8",
          review: "#9D629D"
        },
        typo: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          700: "#404040",
          900: "#171717",
          950: "#575859",
          grey: {
            4: "#6C757D",
            6: "#CED4DA",
            7: "#DEE2E6"
          }
        },
        button: "#D4D4D4",
        breadcrumb: {
          DEFAULT: "#9ca3af",
          current: "#111827"
        },
        // card: {
        //   DEFAULT: "hsl(var(--card))",
        //   foreground: "hsl(var(--card-foreground))"
        // },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))"
        }
      },
      boxShadow: {
        card: "0 15px 35px 0 rgba( 60,66,87, .08),0 5px 15px 0 rgba(0,0,0, .12)"
      }
      //   borderRadius: {
      //     lg: "var(--radius)",
      //     md: "calc(var(--radius) - 2px)",
      //     sm: "calc(var(--radius) - 4px)"
      //   }
    }
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        "input:-webkit-autofill": {
          "-webkit-box-shadow": "0 0 0 1000px white inset !important",
          "-webkit-text-fill-color": "black !important"
        }
      });
    },
    require("tailwindcss-animate"),
    require("tailwind-scrollbar")
  ]
};
