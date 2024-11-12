/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".text-shadow-sm": {
          textShadow: "1px 1px 5px rgba(20, 200, 50, 0.8)",
        },
        ".text-shadow-md": {
          textShadow: "2px 2px 10px rgba(20, 200, 50, 0.9)",
        },
        ".text-shadow-lg": {
          textShadow: "2px 2px 18px rgba(90, 250, 50, 1)",
        },
        ".text-gradient": {
          background: "linear-gradient(to right, cyan, yellow)",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
        },
        ".theme-default": {
          backgroundColor: "rgba(31, 41, 55, 0.75)", // bg-gray-800 bg-opacity-70
          backdropFilter: "blur(24px)", // backdrop-blur-xl
          boxShadow: "0 1px 2px 0 #fde047", // shadow-yellow-300 shadow-sm
          color: "#ffffff", // Set all text to white
          borderColor: "#ffffff", // White border color
        },
        ".theme-light": {
          backgroundColor: "rgba(220, 231, 235, 0.8)", // Lighter background
          backdropFilter: "blur(24px)", // backdrop-blur-xl
          boxShadow: "0 1px 2px 0 #546e7a", // gray shadow color
          color: "#000000", // Set all text to black
          borderColor: "#000000", // Black border color
        },
        ".theme-azure": {
          backgroundColor: "rgba(13, 71, 161, 0.75)", // sky background
          backdropFilter: "blur(40px)", // backdrop-blur-xl
          boxShadow: "0 1px 2px 0 #5dade2", // light blue shadow color
          color: "#bae6fd", // Set all text to sky-200
          borderColor: "#1e88e5", // Bluish border color
        },
      };

      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};
