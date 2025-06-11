/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Light mode colors
        light: {
          bg: "#f4edf8",
          container: "#f9f6fb",
          text: "#2b2b2b",
        },
        // Dark mode colors
        dark: {
          bg: "#1e1e24",
          container: "#2a2a33",
          text: "#f1f1f1",
        },
        // Dynamic primary colors (will be overridden by CSS variables)
        primary: {
          50: "rgb(var(--primary-50) / <alpha-value>)",
          100: "rgb(var(--primary-100) / <alpha-value>)",
          200: "rgb(var(--primary-200) / <alpha-value>)",
          300: "rgb(var(--primary-300) / <alpha-value>)",
          400: "rgb(var(--primary-400) / <alpha-value>)",
          500: "rgb(var(--primary-500) / <alpha-value>)",
          600: "rgb(var(--primary-600) / <alpha-value>)",
          700: "rgb(var(--primary-700) / <alpha-value>)",
          800: "rgb(var(--primary-800) / <alpha-value>)",
          900: "rgb(var(--primary-900) / <alpha-value>)",
          950: "rgb(var(--primary-950) / <alpha-value>)",
        },
        secondary: {
          50: "rgb(var(--secondary-50) / <alpha-value>)",
          100: "rgb(var(--secondary-100) / <alpha-value>)",
          200: "rgb(var(--secondary-200) / <alpha-value>)",
          300: "rgb(var(--secondary-300) / <alpha-value>)",
          400: "rgb(var(--secondary-400) / <alpha-value>)",
          500: "rgb(var(--secondary-500) / <alpha-value>)",
          600: "rgb(var(--secondary-600) / <alpha-value>)",
          700: "rgb(var(--secondary-700) / <alpha-value>)",
          800: "rgb(var(--secondary-800) / <alpha-value>)",
          900: "rgb(var(--secondary-900) / <alpha-value>)",
          950: "rgb(var(--secondary-950) / <alpha-value>)",
        },
        // Theme-aware background variations
        theme: {
          "bg-primary": "rgb(var(--bg-primary) / <alpha-value>)",
          "bg-secondary": "rgb(var(--bg-secondary) / <alpha-value>)",
          "bg-surface": "rgb(var(--bg-surface) / <alpha-value>)",
          "bg-surface-hover": "rgb(var(--bg-surface-hover) / <alpha-value>)",
          "bg-surface-active": "rgb(var(--bg-surface-active) / <alpha-value>)",
          "bg-input": "rgb(var(--bg-input) / <alpha-value>)",
          "bg-input-hover": "rgb(var(--bg-input-hover) / <alpha-value>)",
          "bg-modal": "rgb(var(--bg-modal) / <alpha-value>)",
          "bg-dropdown": "rgb(var(--bg-dropdown) / <alpha-value>)",
          "bg-card": "rgb(var(--bg-card) / <alpha-value>)",
          "bg-card-hover": "rgb(var(--bg-card-hover) / <alpha-value>)",
          "bg-selected": "rgb(var(--bg-selected) / <alpha-value>)",
          "bg-selected-hover": "rgb(var(--bg-selected-hover) / <alpha-value>)",
          gradient: "var(--theme-gradient)",
        },
      },
      backgroundImage: {
        "theme-gradient": "var(--theme-gradient)",
        "chat-container": "var(--chat-container)",
      },
      animation: {
        bounce: "bounce 1.4s infinite ease-in-out",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.08)",
        "glass-dark": "0 8px 32px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};
