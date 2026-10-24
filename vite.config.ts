import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const apiPort = process.env.API_PORT ?? '4000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': `http://localhost:${apiPort}`
    }
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['server/src/**/*.ts', 'src/**/*.{ts,tsx}'],
      exclude: ['server/src/index.ts', 'server/src/scripts/**', 'src/main.tsx', 'src/components/reactbits/**', '**/*.d.ts']
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'api',
          environment: 'node',
          include: ['server/tests/**/*.test.ts']
        }
      },
      {
        extends: true,
        test: {
          name: 'web',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: ['src/test/setup.ts']
        }
      }
    ]
  }
});
