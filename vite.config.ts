import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/neuro-finance/', // GitHub Pagesのリポジトリ名に合わせて調整
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
