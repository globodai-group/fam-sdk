# Sécurité — checklist SDK

- [ ] **Validation des entrées** aux frontières publiques (params, webhooks, config consommateur) — gardes TypeScript explicites dans `src/`, pas de schéma Zod
- [ ] **Pas de fuite de body** dans les erreurs (allowlist `ApiError.details`)
- [ ] **HTTPS obligatoire** sauf localhost dev (refus de `http://` en prod)
- [ ] **Webhooks** : signature obligatoire, fail-closed, comparaison constant-time
- [ ] **Pas de secrets** committés (`.env.example` uniquement, convention `fam_*` — préfixes de clés `fam_sk_` / `fam_pk_`, minuscules)
- [ ] **Audit prod** : `pnpm audit --prod` doit passer (deps de tooling tolérées)
- [ ] **Logger structuré** avec redact des champs sensibles (token, password, authorization, cookie)
- [ ] **Tests adversariaux** sur les chemins de sécurité critiques

Référence noms de variables consommateur : fichier `.env.example` à la racine (`FAM_API_BASE_URL`, `FAM_API_SECRET`, `FAM_API_PUBLIC_KEY`, `FAM_WEBHOOK_SIGNING_SECRET`).
