import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' 讓建置後的檔案用相對路徑引用資源，
// 不論部署在 GitHub Pages 的 user site 或 project site（.../<repo>/）都能正常運作
export default defineConfig({
  plugins: [react()],
  base: './',
})
