/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#026902",
      },
      screens: {
        "custom-380": { max: "380px" },
        "custom-768": { max: "768px" },
        "custom-1024": { max: "1024px" },
        "custom-1500": { max: "1500px" },
      },
    },
  },
  plugins: [],
};
