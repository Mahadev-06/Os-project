import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { getSystemOverview, getLiveMetrics, getLiveProcesses, getDiskInfo } from './src/server/systemMetrics.js'

function systemApiPlugin() {
  return {
    name: 'system-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/system/')) {
          return next()
        }

        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')

        try {
          if (req.url.startsWith('/api/system/overview')) {
            const data = getSystemOverview()
            return res.end(JSON.stringify(data))
          }
          if (req.url.startsWith('/api/system/metrics')) {
            const data = getLiveMetrics()
            return res.end(JSON.stringify(data))
          }
          if (req.url.startsWith('/api/system/processes')) {
            const data = await getLiveProcesses()
            return res.end(JSON.stringify(data))
          }
          if (req.url.startsWith('/api/system/disks')) {
            const data = await getDiskInfo()
            return res.end(JSON.stringify(data))
          }
          next()
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), systemApiPlugin()],
  server: {
    port: 5173,
    open: false
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ['recharts'],
          icons: ['lucide-react']
        }
      }
    }
  }
})

