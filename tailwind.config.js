/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./scripts/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        // custom colors from _var.scss
        'primary': '#066b50',
        'primary-light': '#088567',
        'primary-dark': '#044d39',
        'secondary': '#acd481',
        'secondary-light': '#c5e39f',
        'secondary-dark': '#8fb968',
        'accent': '#cbeab2',
        'accent-light': '#e3f4d7',
        'accent-dark': '#b3d999',
        'cream': '#fffdf8',
      },
      fontFamily: {
        'seasons': ['The Seasons', 'serif'],
        'body': ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
