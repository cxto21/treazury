import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'src/badge-service.test.ts',
      'src/config.test.ts', 
      'src/wallet-config.test.ts'
    ]
  },
});
