// Week12/server/vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js', 'tests/week12.test.js'],
    exclude: ['node_modules', 'dist', '.git']
  }
});