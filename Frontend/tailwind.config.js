/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2933",
        tomato: "#d9480f",
        basil: "#2f9e44",
        saffron: "#f59f00",
      },
    },
  },
  plugins: [],
};
