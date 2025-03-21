/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#282A3A',
        accent: '#735F32',
        highlight: '#C69749',
        // Additional shades for better contrast
        'highlight-light': '#D4AB6A',
        'highlight-dark': '#9A7439',
        'text-light': '#E5E7EB',
        'text-gray': '#4B5563' // Add this line
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100ch',
            color: '#4B5563', // Change this line to use the new gray color
            '.dark &': {
              color: '#E5E7EB',
            },
            a: {
              color: '#D4AB6A',
              '&:hover': {
                color: '#735F32',
              },
            },
            strong: {
              color: '#D4AB6A',
            },
            h1: {
              color: '#D4AB6A',
            },
            h2: {
              color: '#D4AB6A',
            },
            h3: {
              color: '#D4AB6A',
            },
            h4: {
              color: '#D4AB6A',
            },
            code: {
              color: '#C69749',
            },
            p: {
              color: '#4B5563', // Ensure paragraph text is gray in light mode
              '.dark &': {
                color: '#E5E7EB',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}