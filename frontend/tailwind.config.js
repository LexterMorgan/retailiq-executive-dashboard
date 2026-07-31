/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#F8FAFC",
          muted: "#F1F5F9",
        },
        border: {
          DEFAULT: "#E2E8F0",
          subtle: "#F1F5F9",
        },
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          light: "#EFF6FF",
          muted: "#DBEAFE",
        },
        positive: {
          DEFAULT: "#059669",
          light: "#ECFDF5",
        },
        negative: {
          DEFAULT: "#DC2626",
          light: "#FEF2F2",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        "display-sm": ["2rem", { lineHeight: "2.5rem", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        "card-hover":
          "0 4px 12px -2px rgb(15 23 42 / 0.08), 0 2px 6px -2px rgb(15 23 42 / 0.04)",
        header: "0 1px 0 0 rgb(15 23 42 / 0.06)",
        filter: "0 1px 2px 0 rgb(15 23 42 / 0.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.45s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
