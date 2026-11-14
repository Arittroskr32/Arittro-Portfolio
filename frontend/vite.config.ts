import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

// GitHub Pages serves the site from "/" when a custom domain is set, or from
// "/<repo-name>/" otherwise. The deploy workflow passes the right value in
// BASE_PATH; locally it defaults to "/".
const rawBase = process.env.BASE_PATH || '/'
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`

// GitHub Pages has no server-side routing, so deep links like /blog/3 would
// 404. Serving the app as 404.html makes the router handle every URL.
function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    closeBundle() {
      const out = resolve(__dirname, 'dist')
      copyFileSync(resolve(out, 'index.html'), resolve(out, '404.html'))
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base,
  plugins: [react(), spaFallback()],
  define: {
    'import.meta.env.VITE_BUILD_ID': JSON.stringify(process.env.GITHUB_SHA || String(Date.now())),
  },
})
