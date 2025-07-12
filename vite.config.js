import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Gestão de Dízimos, Ofertas e Primícias',
        short_name: 'Prosperando.me',
        description: 'Calcule corretamente seus Dízimos, Ofertas, Primícias e Semeaduras',
        theme_color: '#1A2A2A',
        background_color: '#f4f6fa',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    viteStaticCopy({
      targets: [
        { src: 'style.css', dest: '.' }
      ]
    })
  ],
  server: {
    port: 3000,
    open: true
  },
  preview: {
    allowedHosts: ['prosperando.me']
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        cadastro: resolve(__dirname, 'cadastro.html'),
        calculadora: resolve(__dirname, 'calculadora.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        doacoes: resolve(__dirname, 'doacoes.html'),
        login: resolve(__dirname, 'login.html'),
        membro: resolve(__dirname, 'membro.html'),
        recuperar: resolve(__dirname, 'recuperar.html'),
        sobre: resolve(__dirname, 'sobre.html')
      }
    }
  },
  // Fallback para SPA em servidores estáticos
  // Para preview local, use o plugin vite-plugin-mpa-fallback
}) 