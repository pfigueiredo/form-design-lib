import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'form-design-lib': resolve(__dirname, '../form-design-lib/src/index.ts'),
    },
  },
})
