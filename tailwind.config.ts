import type { Config } from "tailwindcss";

const config = {
  mode: 'jit',
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  safelist: [],
  darkMode: ["class"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Poppins"],
      },
      spacing: {
        "1.25": "0.3rem",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        darkGray: {
          DEFAULT: "hsl(var(--darkGray))",
        },
        primaryRed: {
          DEFAULT: "hsl(var(--primaryRed))",
        },

        lightGray: {
          DEFAULT: "hsl(var(--lightGray))",
        },
        lightBlue: {
          DEFAULT: "hsl(var(--lightBlue))",
        },
        primaryBlue: {
          DEFAULT: "hsl(var(  --primaryBlue))",
        },
        primaryGreen: {
          DEFAULT: "hsl(var(  --primaryGreen))",
        },
        secondaryGreen: {
          DEFAULT: "hsl(var(  --secondaryGreen))",
        },
        primaryPurple: {
          DEFAULT: "hsl(var(  --primaryPurple))",
        },
        secondaryGray: {
          DEFAULT: "hsl(var(  --secondaryGray))",
        },
        primaryDark: {
          DEFAULT: "hsl(var(  --primaryDark))",
        },
        orange: {
          DEFAULT: "hsl(var(--orange))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        blueTh: {
          DEFAULT: "hsl(var(--blueTh))",
        },
        darkBlue: {
          DEFAULT: "hsl(var(--darkBlue))",
        },
        purpleTh: {
          DEFAULT: "hsl(var(--purpleTh))",
        },
        greenTh: {
          DEFAULT: "hsl(var(--greenTh))",
        },
        orangeTh: {
          DEFAULT: "hsl(var(--orangeTh))",
        },
        greyTh: {
          DEFAULT: "hsl(var(--greyTh))",
        },
        secondaryBackground: {
          DEFAULT: "hsl(var(--secondaryBackground))",
        },
        inputBackground: {
          DEFAULT: "hsl(var(--inputBackground))",
        },
        tableBorder: {
          DEFAULT: "hsl(var(--tableBorder))",
        },
        dropDown: {
          DEFAULT: "hsl(var(--dropDown))",
        },
        profileDropDown: {
          DEFAULT: "hsl(var(--profileDropDown))",
        },
        bgGray: {
          DEFAULT: "hsl(var(--bgGray))",
        },
        bgPrimaryGray: {
          DEFAULT: "hsl(var(--bgPrimaryGray))",
        },
        primaryBorderColor: {
          DEFAULT: "hsl(var(--primaryBorderColor))",
        },
        borderColor: {
          DEFAULT: "hsl(var(--borderColor))",
        },
        secondaryDark: {
          DEFAULT: "hsl(var(--secondaryDark))",
        },
        inputBg: {
          DEFAULT: "hsl(var(--inputBg))",
        },
        inputBorder: {
          DEFAULT: "hsl(var(--inputBorder))",
        },
        tagBoxBg: {
          DEFAULT: "hsl(var(--tagBoxBg))",
        },
        headerBackground: {
          DEFAULT: "hsl(var(--headerBackground))",
        },
        subscriptionCardBorder: {
          DEFAULT: "hsl(var(--subscriptionCardBorder))",
        },
        projectCardBackground: {
          DEFAULT: "hsl(var(--projectCardBackground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
