import { playwright } from '@vitest/browser-playwright';
import solidPlugin from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.test.json',
    },
    coverage: {
      provider: 'v8',
    },
  },
});
