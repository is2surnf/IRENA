/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
   plugins: [
    // Plugin para scrollbar personalizada
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'rgba(75, 85, 99, 0.3) transparent',
          '&::-webkit-scrollbar': {
            width: '4px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            'background-color': 'rgba(75, 85, 99, 0.3)',
            'border-radius': '20px',
            border: 'transparent'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            'background-color': 'rgba(75, 85, 99, 0.5)'
          }
        }
      })
    }
  ],
}
