import { brandColors } from './src/theme.js'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: brandColors.primary,
        accent: brandColors.accent,
        'brand-blue': brandColors.brandBlue,
        surface: brandColors.surface,
      },
    },
  },
  plugins: [],
}
