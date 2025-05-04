/* eslint-disable @typescript-eslint/no-require-imports */
const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    heroui({
      defaultTheme: "dark",
      defaultExtendTheme: "dark",
      layout: {},
      themes: {
        dark: {
          colors: {
            background: "#0A0A0A",
            foreground: "#ECEDEE",
            primary: {
              foreground: "#000",
              DEFAULT: "#2BFF00",
            },
          },
        },
      },
    }),
  ],
};