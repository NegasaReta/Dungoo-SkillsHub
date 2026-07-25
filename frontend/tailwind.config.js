import { appColors, brandColors } from './src/theme.js'

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
        app: {
          base: appColors.base,
          panel: appColors.panel,
          'panel-muted': appColors.panelMuted,
          border: appColors.border,
          text: appColors.text,
          muted: appColors.muted,
          blue: appColors.blue,
          teal: appColors.teal,
        },
      },
    },
  },
  plugins: [],
}
