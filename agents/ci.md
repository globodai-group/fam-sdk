# Alignement CI (pull_request / push sur `dev`)

Source : `.github/workflows/ci.yml` — jobs dans cet ordre logique :

1. **BLOCK 1 (parallèle)** : `pnpm install --frozen-lockfile` puis chacun :
   - `pnpm run typecheck`
   - `pnpm run lint`
   - `pnpm run format:check`
   - `pnpm run knip`
   - `pnpm run madge`
2. **BUILD** (après BLOCK 1) : `pnpm run build`
3. **TESTS** (après build) : `pnpm run test:coverage`
4. **DOCS** (après build, parallèle tests) : `pnpm run docs`

Équivalent local regroupé (même contenu que BLOCK 1) :

```bash
pnpm run ci:check    # typecheck + lint + format:check + knip + madge
pnpm run build
pnpm run test:coverage
```

Alternative une ligne pour les scripts `ci:*` du `package.json` :

```bash
pnpm run ci:check && pnpm run ci:build && pnpm run ci:test
```

Note : `prepublishOnly` exécute `ci:check && ci:test && ci:build` (tests avant build) — gate npm publish, pas l’ordre des jobs GitHub.

Ancienne check-list ÉTAPE 3 (équivalent partiel) :

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```
