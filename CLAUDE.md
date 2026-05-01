# CLAUDE.md — fam-sdk

> Toujours répondre en français. Code, commentaires, commits restent en anglais.

## Stack

- **Package manager** : pnpm (lockfile `pnpm-lock.yaml`)
- **Build** : tsup (CJS + ESM + d.ts) → `dist/`
- **Tests** : vitest
- **Lint** : eslint (max-warnings 0) + prettier
- **TS** : strict mode, zéro `any`, zéro `@ts-ignore`
- **Publication** : npm (`globodai-fam-sdk`), release auto sur `main` via semantic-release

## Règles absolues

- ✅ Code complet, jamais de placeholder ni `// TODO`
- ✅ Gestion d'erreurs exhaustive
- ✅ Validation des entrées avec Zod aux frontières
- ✅ Tests pour chaque fix de sécurité ou nouvelle feature publique
- ❌ Pas de `console.log` (logger structuré ou rien)
- ❌ Pas de secrets en dur
- ❌ Pas de `any` / `@ts-ignore` non justifiés
- ❌ Pas de code dupliqué

---

## 🚨 Git workflow — RÈGLES CRITIQUES

### Branches protégées (jamais de push direct)

```
main-release  → JAMAIS TOUCHER (semantic-release auto)
main          → PR uniquement (déclenche la release npm)
rec           → PR uniquement
dev           → PR depuis branche de travail uniquement
```

### Interdictions absolues

```bash
git push origin main|rec|dev      # Direct push interdit
git push --force                  # Sur branches partagées
git reset --hard                  # Sur branches partagées
gh pr merge --squash              # Perte d'historique
gh pr merge --rebase              # Réécrit l'historique
```

### ✅ Type de merge obligatoire

```bash
gh pr merge --merge   # TOUJOURS --merge
```

### Nomenclature des branches

| Préfixe     | Usage                        |
| ----------- | ---------------------------- |
| `feat/`     | Nouvelle fonctionnalité      |
| `fix/`      | Correction de bug            |
| `refactor/` | Refactoring sans impact      |
| `perf/`     | Performance                  |
| `security/` | Fix de sécurité              |
| `chore/`    | Maintenance, deps, config    |
| `docs/`     | Documentation                |

---

## 📋 Processus complet (déclencheurs : "commit", "push", "merger", "release", "déployer")

```
ÉTAPE 1  →  ÉTAPE 2  →  ÉTAPE 3  →  ÉTAPE 4   →  ÉTAPE 5   →  ÉTAPE 6
Branche     Commits     CHECKS      PR → dev     PR → rec     PR → main
travail     atomiques   LOCAUX      merge        merge        merge
                        ⚠️ AVANT PUSH
```

**Règle stricte** : ne jamais passer à l'étape N+1 tant que N n'est pas 100 % validée. Si échec à n'importe quelle étape → retour ÉTAPE 1, nouvelle branche.

### ÉTAPE 1 — Branche de travail

```bash
git fetch origin
git checkout dev && git pull origin dev
git checkout -b feat/ma-feature   # ou fix/, security/, etc.
git branch --show-current         # vérifier
```

### ÉTAPE 2 — Commits atomiques (Conventional Commits)

> 1 commit = 1 modification logique. Si la description contient « et », découper.

```
type(scope): description courte (impératif, < 72 chars)

[body optionnel — pourquoi, pas quoi]
[BREAKING CHANGE: description]
[Fixes #123]
```

| Type       | Bump  | Type       | Bump  |
| ---------- | ----- | ---------- | ----- |
| `feat`     | MINOR | `refactor` | —     |
| `fix`      | PATCH | `style`    | —     |
| `perf`     | PATCH | `test`     | —     |
| `security` | PATCH | `docs`     | —     |
| `chore`    | —     | `ci`       | —     |

### 🚨 ÉTAPE 3 — Checks locaux AVANT TOUT PUSH

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pnpm audit --audit-level=high --prod   # prod-only : les deps de tooling sont tolérées
```

Ou en une commande : `pnpm run ci:check && pnpm run ci:test && pnpm run ci:build`

**Si un check échoue** : corriger → commit atomique du fix → relancer **TOUS** les checks → push uniquement quand tout passe.

**Vérifications finales** :

```bash
git branch --show-current   # branche de travail (pas dev/rec/main)
git status                  # working tree clean
git diff --cached --name-only   # pas de .env / secrets
```

### ÉTAPE 4 — PR branche → dev

```bash
git push origin feat/ma-feature
gh pr create --base dev --head feat/ma-feature \
  --title "type(scope): description" \
  --body "..."
gh pr checks --watch
gh pr merge --merge --delete-branch
```

### ÉTAPE 5 — PR dev → rec

```bash
git checkout dev && git pull origin dev
gh pr create --base rec --head dev --title "chore: promote dev to rec"
gh pr checks --watch
gh pr merge --merge
```

### ÉTAPE 6 — PR rec → main (release npm)

```bash
git checkout rec && git pull origin rec
gh pr create --base main --head rec --title "chore: release to production"
gh pr checks --watch
gh pr merge --merge
# semantic-release publie sur npm + tag + CHANGELOG
```

---

## Sécurité — checklist SDK

- [ ] **Validation des entrées** Zod à toutes les frontières (params publics, webhooks, env)
- [ ] **Pas de fuite de body** dans les erreurs (allowlist `ApiError.details`)
- [ ] **HTTPS obligatoire** sauf localhost dev (refus de `http://` en prod)
- [ ] **Webhooks** : signature obligatoire, fail-closed, comparaison constant-time
- [ ] **Pas de secrets** committés (`.env.example` uniquement, convention `fam_*`)
- [ ] **Audit prod** : `pnpm audit --prod` doit passer (deps de tooling tolérées)
- [ ] **Logger structuré** avec redact des champs sensibles (token, password, authorization, cookie)
- [ ] **Tests adversariaux** sur les chemins de sécurité critiques

### Validation env (exemple)

```typescript
import { z } from 'zod';

const envSchema = z.object({
  FAM_API_KEY: z.string().min(32),
  FAM_BASE_URL: z.string().url(),
  FAM_WEBHOOK_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);
```

---

## Commandes utiles

```bash
# Dev
pnpm install
pnpm run dev          # tsup --watch
pnpm run test:watch
pnpm run check        # typecheck + lint + format:check

# Pré-publish
pnpm run prepublishOnly   # ci:check + ci:test + ci:build

# Git / GitHub
git branch --show-current
git log --oneline -10
gh pr list
gh pr checks --watch
gh pr merge --merge
gh run list --limit 10
```

---

## ⚠️ En cas de doute — DEMANDER CONFIRMATION

- Toute opération sur `main`, `rec`, `main-release`
- Suppression de fichiers / code
- Changements CI/CD (`.github/workflows/`)
- Mise à jour de dépendances majeures
- Rollback ou revert de commits publiés
- Modification du schéma de release (semantic-release, package.json `version`)
