/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          cream: "#F8F5F0",
          surface: "#FFFDF9",
          gold: "#FFD700",
          "gold-dark": "#C58B00",
          green: {
            50: "#F4F1EC",
            100: "#E8E1D6",
            700: "#3A3A3A",
            800: "#2A2A2A",
            900: "#181818",
            950: "#111111"
          }
        }
      },
      fontFamily: {
        display: ["Georgia", "Times New Roman", "serif"],
        body: ["Segoe UI", "Tahoma", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 45px rgba(17, 17, 17, 0.10)"
      }
    },
  },
  plugins: [],
};
