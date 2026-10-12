import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Organization GitHub Pages and custom domains use '/'. Subpath hosts can
// override VITE_BASE when building outside the canonical deployment.
const rawBase = process.env.VITE_BASE?.trim()
const base = !rawBase || rawBase === '/' ? '/' : rawBase.endsWith('/') ? rawBase : `${rawBase}/`

export default defineConfig({
  base,
  plugins: [
    {
      name: 'demo-public-assets',
      transform(source, id) {
        if (base === '/' || !id.includes('/src/demo/product/')) return
        // Preserve the upstream files; resolve their public icon under this site's base.
        return {
          code: source.replaceAll('"/sillage-icon.svg"', JSON.stringify(`${base}sillage-icon.svg`)),
          map: null,
        }
      },
    },
    react(),
    tailwindcss(),
  ],
  build: {
    rolldownOptions: {
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        demo: fileURLToPath(new URL('./demo/index.html', import.meta.url)),
      },
    },
    target: 'es2022',
    cssMinify: true,
    sourcemap: false,
  },
})
