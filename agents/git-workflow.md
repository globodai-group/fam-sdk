# Git workflow — RÈGLES CRITIQUES

## Branches protégées (jamais de push direct)

```
main          → PR uniquement (déclenche la release npm)
rec           → PR uniquement
dev           → PR depuis branche de travail uniquement
```

## Interdictions absolues

```bash
git push origin main|rec|dev      # Direct push interdit
git push --force                  # Sur branches partagées
git reset --hard                  # Sur branches partagées
gh pr merge --squash              # Perte d'historique
gh pr merge --rebase              # Réécrit l'historique
```

## Type de merge obligatoire

```bash
gh pr merge --merge   # TOUJOURS --merge
```

## Nomenclature des branches

| Préfixe     | Usage                        |
| ----------- | ---------------------------- |
| `feat/`     | Nouvelle fonctionnalité      |
| `fix/`      | Correction de bug            |
| `refactor/` | Refactoring sans impact      |
| `perf/`     | Performance                  |
| `security/` | Fix de sécurité              |
| `chore/`    | Maintenance, deps, config    |
| `docs/`     | Documentation                |

## Processus complet (déclencheurs : "commit", "push", "merger", "release", "déployer")

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

### ÉTAPE 2 — Commits atomiques

Voir `agents/commits-and-release.md` (types Conventional Commits, `commitlint.config.js`, semantic-release).

### ÉTAPE 3 — Checks locaux AVANT TOUT PUSH

Voir `agents/ci.md` pour la séquence alignée sur `.github/workflows/ci.yml`.

```bash
pnpm audit --audit-level=high --prod   # prod-only : les deps de tooling sont tolérées
```

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
# semantic-release publie sur npm + tag ; notes dans la release GitHub (pas de CHANGELOG fichier)
```

## Commandes Git / GitHub utiles

```bash
git branch --show-current
git log --oneline -10
gh pr list
gh pr checks --watch
gh pr merge --merge
gh run list --limit 10
```

## En cas de doute — DEMANDER CONFIRMATION

- Toute opération sur `main`, `rec`
- Suppression de fichiers / code
- Changements CI/CD (`.github/workflows/`)
- Mise à jour de dépendances majeures
- Rollback ou revert de commits publiés
- Modification du schéma de release (semantic-release, package.json `version`)
