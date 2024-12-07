const defaultTheme = require("tailwindcss/defaultTheme");
const { blackA } = require("@radix-ui/colors");

/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  safelist: ["bg-red-500", "text-3xl", "lg:text-4xl", "bg-pupilsLimeGreen"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      textColor: {
        default: "#222222",
      },
      colors: {
        ...blackA,
        white: "#fff",
        black: "#222222",
        transparent: "transparent",
        inherit: "inherit",
        grey1: "#f2f2f2",
        grey2: "#e6e6e6",
        grey3: "#ccc",
        grey4: "#b3b3b3",
        grey5: "#999",
        grey6: "#808080",
        grey7: "#666",
        grey8: "#4d4d4d",
        grey9: "#333",
        grey10: "#1a1a1a",
        oakGrey1: "#f5f5f5",
        oakGrey2: "#dadada",
        oakGrey3: "#878787",
        oakGrey4: "#575756",
        oakGrey5: "#2D2D2D",
        oakGrey6: "#1B1B1B",
        pastelTurquoise: "#b0e2de",
        warning: "#ff7234",
        failure: "#e51d4d",
        success: "#a3e420",
        pupilsHighlight: "#25AB38",
        pupilsAccentPink: "#d02aa7",
        pupilsGreen: "#85cb6d",
        pupilsLightGreen: "#D5EFD4",
        pupilsLimeGreen: "#BEF2BD",
        pupilsPink: "#deb7d5",
        teachersHighlight: "#374CF1",
        teachersGreen: "#037b7d",
        teachersYellow: "#ffe555",
        teachersPastelYellow: "#f6e8a0",
        teachersPastelBlue: "#a0b6f2",
        teachersRed: "#e51d4d",
        teachersPurple: "#845ad9",
        teachersLilac: "#c6d1ef",
        twilight: "#E5D1E0",
        videoBlue: "#CEE7E5",
        hyperlink: "#0D24C4",
        oakGreen: "#25ab38",
        mint: "#bef2bd",
        mint50: "#d5efd4",
        mint30: "#ebfbeb",
        aqua: "#b0e2de",
        aqua50: "#cee7e5",
        aqua30: "#e7f6f5",
        lemon: "#ffe555",
        lemon50: "#f6e8a0",
        lemon30: "#fff7cc",
        lavender: "#a0b6f2",
        lavender50: "#c6d1ef",
        lavender30: "#e3e9fb",
        pink: "#deb7d5",
        pink50: "#e5d1e0",
        pink30: "#f5e9f2",
        amber: "#ff934e",
        amber50: "#ffc8a6",
        amber30: "#ffdfca",
        blue: "#374cf1",
        magenta: "#d02aa7",
        purple: "#845ad9",
        teal: "#037b7d",
        peachCream: "#ffece0",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
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
      },
      fontFamily: {
        sans: ["Lexend", ...defaultTheme.fontFamily.sans],
        // sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
      fontSize: {
        xs: "12px",
        sm: "14px",
        base: "16px",
        md: "17.6px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
      },
      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
      lineHeight: {
        none: "1",
        tight: "1.25",
        snug: "1.375",
        normal: "1.5",
        relaxed: "1.625",
        loose: "2",
      },
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },
      spacing: {
        1: "0px",
        2: "1px",
        3: "2px",
        4: "3px",
        5: "4px",
        6: "6px",
        7: "8px",
        8: "10px",
        9: "12px",
        10: "16px",
        11: "18px",
        12: "20px",
        13: "22px",
        14: "24px",
        15: "26px",
        16: "28px",
        17: "30px",
        18: "32px",
        19: "36px",
        20: "40px",
        21: "44px",
        22: "48px",
        23: "50px",
        24: "56px",
        25: "64px",
        26: "72px",
        27: "80px",
        28: "92px",
        29: "96px",
        30: "110px",
        31: "120px",
        32: "130px",
        33: "140px",
        34: "150px",
        35: "160px",
        36: "166px",
        37: "172px",
        38: "200px",
        39: "220px",
        40: "240px",
        41: "270px",
        42: "300px",
        43: "320px",
        44: "340px",
        45: "350px",
        46: "360px",
        47: "380px",
        48: "400px",
        49: "420px",
        50: "450px",
        51: "480px",
        52: "580px",
        53: "600px",
        54: "640px",
        55: "720px",
        56: "740px",
        57: "812px",
        58: "840px",
        59: "900px",
        60: "960px",
        61: "1280px",
        62: "1600px",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { background: "#F2F2F2" },
          "50%": { background: "#D8D8D8" },
        },
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "slide-from-left": {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(0)",
          },
        },
        "slide-to-left": {
          "0%": {
            transform: "translateX(0)",
          },
          "100%": {
            transform: "translateX(-100%)",
          },
        },
      },
      animation: {
        "slide-from-left":
          "slide-from-left 0.3s cubic-bezier(0.82, 0.085, 0.395, 0.895)",
        "slide-to-left":
          "slide-to-left 0.25s cubic-bezier(0.82, 0.085, 0.395, 0.895)",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
