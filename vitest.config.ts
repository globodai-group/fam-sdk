import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      // The /webhooks subpath source re-exports from the package itself
      // (`globodai-fam-sdk`) so that, after bundling with tsup `external`,
      // both entry-points share a single runtime. In tests, alias the
      // self-reference back to the local source so vitest finds the live
      // classes (otherwise it tries to resolve `globodai-fam-sdk` from
      // node_modules and fails because we are the package).
      'globodai-fam-sdk': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.*',
        '**/*.d.ts',
        'src/index.ts',
        'src/types/**',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    testTimeout: 10000,
  },
})
