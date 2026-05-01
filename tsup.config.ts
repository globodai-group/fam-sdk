import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'webhooks/index': 'src/webhooks/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  minify: false,
  target: 'es2022',
  outDir: 'dist',
  tsconfig: 'tsconfig.build.json',
  // Mark the package itself as external so that the /webhooks subpath bundle
  // does not re-inline the runtime classes defined at the root entry-point.
  // At load time the subpath resolves `require('globodai-fam-sdk')` to
  // dist/index.{cjs,js}, guaranteeing a single instance of `Webhooks`,
  // `WebhookSignatureError` and `WebhookPayloadError` across entry-points
  // (so `instanceof` is stable).
  external: ['globodai-fam-sdk'],
})
