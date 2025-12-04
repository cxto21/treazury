import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Existing env vars
        'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.STARKNET_RPC': JSON.stringify(env.STARKNET_RPC || 'https://ztarknet-madara.d.karnot.xyz'),
        'process.env.ZKPASSPORT_CONTRACT': JSON.stringify(env.ZKPASSPORT_CONTRACT || ''),
        
        // TreazuryVault v2.0 configuration
        'process.env.TREAZURY_VAULT_ADDRESS': JSON.stringify(
          env.TREAZURY_VAULT_ADDRESS || '0x04cbe8011bddc3fa7d7832db096122f3ec5bb937f5bf5b3db852319664239196'
        ),
        'process.env.TREAZURY_VAULT_OWNER': JSON.stringify(
          env.TREAZURY_VAULT_OWNER || '0x5b7213d74268643e884c026569b800f463fd9f5b86493fb2551c38507f045fa'
        ),
        'process.env.NETWORK': JSON.stringify(env.NETWORK || 'ztarknet-testnet'),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        // Optimizar para Cloudflare Pages
        outDir: 'dist',
        target: 'esnext',
        minify: 'terser',
        rollupOptions: {
          output: {
            manualChunks: {
              'react': ['react', 'react-dom'],
              'starknet': ['starknet', 'get-starknet'],
            }
          }
        }
      }
    };
});
