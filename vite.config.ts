import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Sätter projektets rot till den nuvarande mappen
  // för att slippa en separat 'src'-mapp.
  root: '.',
  build: {
    // Definierar utdatamappen till 'dist'
    outDir: 'dist'
  }
})
