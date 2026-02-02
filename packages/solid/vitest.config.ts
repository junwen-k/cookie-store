import solidPlugin from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    coverage: {
      enabled: true,
      provider: 'v8',
    },
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.test.json',
    },
    browser: {
      enabled: true,
      headless: true,
      provider: 'playwright',
      instances: [
        {
          browser: 'chromium',
        },
      ],
    },
  },
});
