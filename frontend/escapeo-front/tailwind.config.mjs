/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBackground: "#0a0a0a",
        darkForeground: "#ededed",
        lightBackground: "#ffffff",
        lightForeground: "#171717",
      },
      fontFamily: {
        urbanist: ["Urbanist", "sans-serif"],
        fira: ["Fira Sans", "sans-serif"],
        karla: ["Karla", "sans-serif"],
        robotoSlab: ["Roboto Slab", "serif"],
      },
    },
  },
  darkMode: "media", // Automatically switch based on system preference
  plugins: [],
};
