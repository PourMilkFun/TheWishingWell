import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ['buffer', 'process', 'stream', 'util'],
      globals: { Buffer: true, global: true, process: true },
    }),
  ],
  define: {
    'process.env': {},
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/pump-ipfs': {
        target: 'https://pump.fun',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/pump-ipfs/, '/api/ipfs'),
      },
      '/api/live-quotes': {
        target: 'https://launchondeep.com',
        changeOrigin: true,
        rewrite: () => '/api/quotes',
      },
      '/api/pump-coin': {
        target: 'https://frontend-api-v3.pump.fun',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/pump-coin/, '/coins'),
      },
    },
  },
  optimizeDeps: {
    include: ['bn.js', 'buffer', '@coral-xyz/anchor', '@pump-fun/pump-sdk', '@solana/web3.js'],
  },
  build: {
    commonjsOptions: { transformMixedEsModules: true },
  },
})
