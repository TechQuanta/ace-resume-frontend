/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}', // Your project files to scan for Tailwind classes
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1DA1F2',
        secondary: '#14171A',
      },
      fontFamily: {
        // --- ASTONISHING FONT ALIASES ---
        headline: ['oxygen'], // Elegant serif for titles
        body: ['Lato', 'sans-serif'],             // Clean sans-serif for main text
        label: ['Montserrat', 'sans-serif'],     // Modern sans-serif for UI/labels
        // --- END ASTONISHING FONT ALIASES ---

        // Your existing individual font definitions (keeping them for completeness,
        // but now 'headline', 'body', 'label' are your primary aliases)
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        'open-sans': ['"Open Sans"', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
        'source-sans-3': ['"Source Sans 3"', 'sans-serif'],
        raleway: ['Raleway', 'sans-serif'],
        merriweather: ['Merriweather', 'serif'],
        lora: ['Lora', 'serif'],
        'noto-sans': ['"Noto Sans"', 'sans-serif'],
        'playfair-display': ['"Playfair Display"', 'serif'],
        ubuntu: ['Ubuntu', 'sans-serif'],
        'crimson-text': ['"Crimson Text"', 'serif'],
        pacifico: ['Pacifico', 'cursive'],
        comfortaa: ['Comfortaa', 'cursive'],
        quicksand: ['Quicksand', 'sans-serif'],
        'indie-flower': ['"Indie Flower"', 'cursive'],
        'bebas-neue': ['"Bebas Neue"', 'sans-serif'],
        'cormorant-garamond': ['"Cormorant Garamond"', 'serif'],
        'fira-sans': ['"Fira Sans"', 'sans-serif'],
        kanit: ['Kanit', 'sans-serif'],
        'josefin-sans': ['"Josefin Sans"', 'sans-serif'],
        lobster: ['Lobster', 'cursive'],
        'abril-fatface': ['"Abril Fatface"', 'cursive'],
        'exo-2': ['"Exo 2"', 'sans-serif'],
        'dancing-script': ['"Dancing Script"', 'cursive'],
        rubik: ['Rubik', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
        vollkorn: ['Vollkorn', 'serif'],
        'pt-sans': ['"PT Sans"', 'sans-serif'],
        'frank-ruhl-libre': ['"Frank Ruhl Libre"', 'serif'],
        'work-sans': ['"Work Sans"', 'sans-serif'],
        bitter: ['Bitter', 'serif'],
        anton: ['Anton', 'sans-serif'],
        archivo: ['Archivo', 'sans-serif'],
        dosis: ['Dosis', 'sans-serif'],
        oxygen: ['Oxygen', 'sans-serif'],
        karla: ['Karla', 'sans-serif'],
        'space-grotesk': ['"Space Grotesk"', 'sans-serif'],
        'encode-sans-condensed': ['"Encode Sans Condensed"', 'sans-serif'],
        muli: ['Muli', 'sans-serif'],
        cabin: ['Cabin', 'sans-serif'],
        'permanent-marker': ['"Permanent Marker"', 'cursive'],
        'shadows-into-light': ['"Shadows Into Light"', 'cursive'],
        'amatic-sc': ['"Amatic SC"', 'cursive'],
        'josefin-slab': ['"Josefin Slab"', 'serif'],
        caveat: ['Caveat', 'cursive'],
        courgette: ['Courgette', 'cursive'],
        satisfy: ['Satisfy', 'cursive'],
        handlee: ['Handlee', 'cursive'],
        arimo: ['Arimo', 'sans-serif'],
        prompt: ['Prompt', 'sans-serif'],
        'ibm-plex-sans': ['"IBM Plex Sans"', 'sans-serif'],
        'slabo-27px': ['"Slabo 27px"', 'serif'],
        'quattrocento-sans': ['"Quattrocento Sans"', 'sans-serif'],
        'rubik-mono-one': ['"Rubik Mono One"', 'sans-serif'],
        'special-elite': ['"Special Elite"', 'cursive'],
        // General sans-serif fallback, prioritizing Google fonts from your existing list
        sans: [
          'Lato', // Primary choice for general sans-serif text (matches 'body')
          'Montserrat', // Good alternative (matches 'label')
          'Roboto',
          '"Open Sans"',
          'Poppins',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        serif: [
          '"Playfair Display"', // Primary choice for general serif text (matches 'headline')
          'Merriweather',
          'Lora',
          'Crimson Text',
          'Cormorant Garamond',
          'Vollkorn',
          'Frank Ruhl Libre',
          'Bitter',
          'Slabo 27px',
          'ui-serif',
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'Times',
          'serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      animation: {
        fadeInSlow: 'fadeIn 1.5s ease-out',
        fadeInUp: 'fadeInUp 0.8s ease-out',
        bounceIn: 'bounceIn 0.5s ease-in-out',
        'loading-bar-full': 'loadingBarFull 1.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%, 100%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1)' },
        },
        loadingBarFull: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      boxShadow: {
        'bottom-sm': '0 2px 4px rgba(0, 0, 0, 0.15)',
        'bottom-md': '0 4px 8px rgba(0, 0, 0, 0.25)',
        'bottom-lg': '0 6px 12px rgba(0, 0, 0, 0.35)',
        'dark-bottom-md': '0 4px 8px rgba(0, 0, 0, 0.4)',
        'dark-bottom-lg': '0 6px 16px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.backdrop-filter-none': {
          backdropFilter: 'none',
        },
        '.backdrop-blur-sm': {
          backdropFilter: 'blur(4px)',
        },
        '.backdrop-blur-md': {
          backdropFilter: 'blur(8px)',
        },
        '.backdrop-blur-lg': {
          backdropFilter: 'blur(12px)',
        },
        '.backdrop-blur-xl': {
          backdropFilter: 'blur(16px)',
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
};