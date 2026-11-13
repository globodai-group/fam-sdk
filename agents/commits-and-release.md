# Commits atomiques (Conventional Commits)

> 1 commit = 1 modification logique. Si la description contient « et », découper.

```
type(scope): description courte (impératif, < 72 chars)

[body optionnel — pourquoi, pas quoi]
[BREAKING CHANGE: description]
[Fixes #123]
```

Types autorisés : `commitlint.config.js` (`type-enum`). Pas de type `security` — fixes sécurité en `fix` (branche `security/` OK).

| Type       | Bump  | Type       | Bump  |
| ---------- | ----- | ---------- | ----- |
| `feat`     | MINOR | `refactor` | PATCH |
| `fix`      | PATCH | `test`     | PATCH |
| `perf`     | PATCH | `build`    | PATCH |
| `revert`   | PATCH | `ci`       | PATCH |
| `docs`     | PATCH | `chore`    | PATCH |
| `style`    | PATCH |            |       |

Patches pour `docs`, `style`, `chore`, `refactor`, `test`, `build`, `ci`, `revert` : `releaseRules` dans `.releaserc.json` (`@semantic-release/commit-analyzer`).

Publication npm : package `globodai-fam-sdk`, workflow Release sur push `main`, configuration `.releaserc.json` (branche `main`).
