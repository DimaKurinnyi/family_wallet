module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      sm: '640px',   // small tablets
      md: '768px',   // tablets
      lg: '1024px',  // desktops
      xl: '1280px',  // large desktops
    },
    extend: {},
  },
  plugins: [],
};