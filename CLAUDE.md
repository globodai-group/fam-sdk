# CLAUDE.md — fam-sdk

> Toujours répondre en français. Code, commentaires, commits restent en anglais.

SDK TypeScript FAM (`globodai-fam-sdk`). Client HTTP, modules, webhooks. Release npm sur push `main` (`.github/workflows/release.yml`).

## Stack

- pnpm (`pnpm-lock.yaml`, `packageManager` `pnpm@9.15.4`)
- Build : tsup → `dist/` (CJS + ESM + `.d.ts`)
- Tests : vitest · Lint : eslint `--max-warnings 0` + prettier · TS strict, zéro `any`, zéro `@ts-ignore`

## Arborescence

- `src/index.ts` — point d’entrée public · `src/client.ts`, `src/fam.ts` — client principal
- `src/modules/` — endpoints API · `src/webhooks/` — vérification signatures
- `src/utils/` — utilitaires partagés · `src/errors/` — `ApiError` et dérivées · `src/types/` — types partagés
- `src/__tests__/` — tests vitest · `.github/workflows/ci.yml` — CI PR
- Config : `tsup` (build), `knip.json`, `.releaserc.json`

## Règles absolues

- Code complet, pas de `// TODO` ; erreurs exhaustives ; validation manuelle aux frontières publiques (TS strict + gardes, pas de Zod)
- Tests obligatoires pour tout fix sécurité ou feature publique
- Pas de `console.log` (logger structuré ou rien) · pas de secrets en dur · pas de duplication
- Git : jamais de push direct sur `main`, `rec`, `dev` ; merge PR uniquement `gh pr merge --merge` (pas squash/rebase) ; pas de `git push --force` ni `git reset --hard` sur branches partagées
- Branches protégées : `main` (release npm), `rec`, `dev` — travail sur `feat/`, `fix/`, `refactor/`, `perf/`, `security/`, `chore/`, `docs/`

## Commandes

```bash
pnpm install
pnpm run dev              # tsup --watch
pnpm run check            # typecheck + lint + format:check
pnpm run ci:check         # check + knip + madge (aligné jobs CI static)
pnpm run build
pnpm run test             # vitest run
pnpm run test:watch
pnpm run test:coverage    # comme job Tests CI
pnpm run ci:check && pnpm run build && pnpm run test:coverage   # pré-push (voir agents/ci.md)
pnpm run prepublishOnly   # ci:check + ci:test + ci:build (npm publish gate)
```

Sécurité (résumé) : validation frontières ; allowlist `ApiError.details` ; HTTPS ; webhooks fail-closed ; `.env.example`, convention `fam_*` (`fam_sk_`/`fam_pk_`, minuscules) — `agents/security.md`.

## Detailed docs

- `agents/git-workflow.md` : lire avant push, PR ou promotion dev → rec → main
- `agents/ci.md` : lire avant de valider localement « comme la CI »
- `agents/commits-and-release.md` : lire avant commit ou release
- `agents/security.md` : lire avant tout changement webhooks, erreurs API ou secrets

## En cas de doute — DEMANDER CONFIRMATION

`main`/`rec` ; suppression fichier ou code ; CI (`.github/workflows/`) ; deps majeures ; revert ; schéma release (semantic-release, `package.json` `version`).
