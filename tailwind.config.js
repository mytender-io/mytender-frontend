/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        orange: "#FF8019",
        orange_light: "#FF8F29"
      },
      boxShadow: {
        card: "0 15px 35px 0 rgba( 60,66,87, .08),0 5px 15px 0 rgba(0,0,0, .12)"
      }
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
    import("tailwindcss-animate")
  ]
};

