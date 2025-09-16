/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // カフェラテカラーパレット
        'latte': {
          50: '#fdfbf7',   // ミルクフォーム
          100: '#f8f4ed',  // スチームミルク
          200: '#e8dcc8',  // ライトラテ
          300: '#d4c4aa',  // ラテ
          400: '#b89968',  // カプチーノ
          500: '#9b7e5a',  // エスプレッソミルク
          600: '#7d6347',  // ダークラテ
          700: '#5e4a36',  // モカ
          800: '#463628',  // ダークモカ
          900: '#362a20',  // エスプレッソ
        },
        // 緑のアクセントカラー（植物・成長・安心感）
        'sage': {
          50: '#f6f9f4',
          100: '#e8f0e3',
          200: '#d1e1c7',
          300: '#a8c69f',  // メインのアクセント
          400: '#7fa877',
          500: '#5e8e56',  // 達成・成功の色
          600: '#4a7044',
          700: '#3b5936',
          800: '#30462c',
          900: '#273824',
        },
        // 機能的な色（エラー、警告など）
        'functional': {
          'success': '#5e8e56',  // sage-500
          'warning': '#daa520',  // ゴールデンロッド（優しい警告色）
          'danger': '#c67171',   // テラコッタ（優しい危険色）
          'info': '#6b8cae',     // スモーキーブルー（落ち着いた情報色）
        },
        // 気分カラー（彩度を抑えた優しい色）
        'mood': {
          'happy': '#a8c69f',    // sage-300
          'stable': '#6b8cae',   // スモーキーブルー
          'tired': '#daa520',    // ゴールデンロッド
          'stressed': '#c67171', // テラコッタ
          'anxious': '#9b8b9b',  // グレイッシュパープル
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'grow': 'grow 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-down': 'slide-down 0.3s ease-out',
      },
      keyframes: {
        grow: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      // 影をソフトに
      boxShadow: {
        'soft-sm': '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'soft-md': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
  safelist: [
    'animate-slide-down'
  ],
}
