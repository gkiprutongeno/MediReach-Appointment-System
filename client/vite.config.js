import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  // Production build optimizations
  build: {
    // Output directory
    outDir: 'dist',
    // Generate sourcemaps for production debugging (optional, remove if not needed)
    sourcemap: false,
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'date-fns'],
        }
      }
    },
    // Minification
    minify: 'esbuild',
    // Target modern browsers
    target: 'es2015',
    // Chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,
  },
  // Ensure esbuild parses JSX in .js files during dependency scanning
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  }
})

