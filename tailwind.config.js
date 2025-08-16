/** @type {import('tailwindcss').Config} */
module.exports = {
  // Update the content path to look inside the 'src' directory
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};