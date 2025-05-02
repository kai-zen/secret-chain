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
      defaultTheme: "light",
      defaultExtendTheme: "light",
      layout: {},
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#C51605",
            },
            secondary: {
              DEFAULT: "#FD8D14",
            },
          },
        },
      },
    }),
  ],
};