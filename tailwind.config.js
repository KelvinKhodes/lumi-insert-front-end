/**
 * Design language: Apple / macOS / SwiftUI minimalism.
 *
 * Token rationale (see /docs/DESIGN.md for the full plan):
 * - "canvas"   → the light-gray desktop the app "window" floats on (macOS System Settings feel)
 * - "surface"  → card / panel white
 * - "sidebar"  → translucent vibrancy panel
 * - "accent"   → macOS Sonoma system blue (primary actions, active nav state)
 * - "ink"      → Apple's near-black / secondary gray text pair
 * - system semantic colors (green/orange/red/teal) mirror iOS/macOS system colors,
 *   used consistently for success / warning / danger / info states across the app.
 */
export default {
  content: ['./index.html', './src/**/*.{svelte,js,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#F5F5F7',
        surface: '#FFFFFF',
        'surface-muted': '#FBFBFD',
        sidebar: 'rgba(246, 246, 248, 0.78)',
        hairline: 'rgba(0, 0, 0, 0.08)',
        ink: {
          DEFAULT: '#1D1D1F',
          secondary: '#6E6E73',
          tertiary: '#AEAEB2'
        },
        accent: {
          DEFAULT: '#0A84FF',
          hover: '#0071E3',
          soft: 'rgba(10, 132, 255, 0.12)'
        },
        success: { DEFAULT: '#30D158', soft: 'rgba(48, 209, 88, 0.12)' },
        warning: { DEFAULT: '#FF9F0A', soft: 'rgba(255, 159, 10, 0.12)' },
        danger: { DEFAULT: '#FF453A', soft: 'rgba(255, 69, 58, 0.12)' },
        info: { DEFAULT: '#64D2FF', soft: 'rgba(100, 210, 255, 0.12)' },

        // dark mode counterparts
        dark: {
          canvas: '#1C1C1E',
          surface: '#2C2C2E',
          'surface-muted': '#252527',
          sidebar: 'rgba(28, 28, 30, 0.78)',
          hairline: 'rgba(255, 255, 255, 0.09)'
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"Segoe UI"',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        mono: [
          'ui-monospace',
          '"SF Mono"',
          'Menlo',
          '"Cascadia Code"',
          'monospace'
        ]
      },
      borderRadius: {
        sf: '14px',
        control: '10px'
      },
      boxShadow: {
        window: '0 20px 60px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        card: '0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 1px rgba(0, 0, 0, 0.03)',
        popover: '0 12px 28px -8px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.05)'
      },
      backdropBlur: {
        sf: '20px'
      }
    }
  },
  plugins: []
};
