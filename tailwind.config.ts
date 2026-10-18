import type { Config } from "tailwindcss";

/**
 * রঙের প্যালেট / Soft, warm keepsake-album palette.
 * cream (প্রস্তর) · blush (গোলাপি) · lavender (জবা) · mint (পুদিনা)
 * All colours are deliberately low-saturation and high-lightness so photos stand out.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FFFCF7",
          100: "#FDF6EC",
          200: "#FAEBD9",
          300: "#F3DDC3",
        },
        blush: {
          50: "#FEF4F4",
          100: "#FBE4E3",
          200: "#F7D0CE",
          300: "#EFB3AF",
          400: "#DF8E89",
          500: "#C9706B",
          600: "#A85450",
        },
        lavender: {
          50: "#F7F5FC",
          100: "#ECE7F8",
          200: "#DAD1F0",
          300: "#C1B2E3",
          400: "#A28ED0",
          500: "#8069B4",
          600: "#635092",
          700: "#4E3F73",
        },
        mint: {
          50: "#F2FAF6",
          100: "#E1F3E9",
          200: "#C5E7D5",
          300: "#A0D3B9",
          400: "#78B998",
          500: "#579B79",
          600: "#437D61",
          700: "#35634D",
        },
        ink: {
          100: "#EDE8E6",
          300: "#B4A7AE",
          500: "#7C6C74",
          700: "#55454E",
          900: "#3A2C34",
        },
      },
      fontFamily: {
        body: ["var(--font-body)", "Hind Siliguri", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Noto Serif Bengali", "serif"],
      },
      boxShadow: {
        soft: "0 2px 12px -2px rgba(122, 85, 90, 0.08), 0 6px 24px -8px rgba(122, 85, 90, 0.10)",
        lift: "0 6px 28px -10px rgba(122, 85, 90, 0.22)",
        photo: "0 1px 2px rgba(58, 44, 52, 0.06), 0 12px 32px -16px rgba(58, 44, 52, 0.28)",
      },
      borderRadius: {
        card: "1.75rem",
        blob: "2.5rem",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
