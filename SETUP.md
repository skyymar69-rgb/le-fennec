# Le Fennec — Configuration Supabase

## Backend actif

Le site utilise le projet Supabase `wejuntknwgawpxvamrrs` (organisation skyymar69-rgb, région eu-central-1).

- **URL** : https://wejuntknwgawpxvamrrs.supabase.co
- **Clé publique** : voir `.env` (`VITE_SUPABASE_ANON_KEY`)
- Schéma déjà appliqué (tables `profiles`, `listings`, `favorites`, `threads`, `messages`, `boosts`, `moderation_logs` + RLS + realtime + buckets `listings`/`avatars`).
- 960 annonces de démonstration insérées.

> Historique : l'ancien projet `eubqfxedbxsdcvvzwqzp` a été mis en pause par Supabase
> (limite de 2 projets actifs du plan gratuit) — c'est ce qui avait rendu le site
> non fonctionnel. Le backend a été rebasculé sur un projet actif le 12/07/2026.

## Comptes de démonstration

- Vendeur : `demo@le-fennec.dz` / `Fennec-Demo-2026!` (propriétaire des annonces de démo)
- Acheteur : `test@le-fennec.dz` / `Fennec-Test-2026!`

## Recréer le schéma (nouveau projet)

1. Supabase Dashboard → SQL Editor
2. Copie-colle le contenu de `supabase_schema.sql` → Run
3. Storage : créer les buckets publics `listings` et `avatars`
4. Database → Replication : activer realtime sur `messages` et `threads`
5. Mettre à jour `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

## Activer Google OAuth (optionnel)

1. Supabase Dashboard → Authentication → Providers → Google
2. Ajoute ton Client ID + Secret (Google Cloud Console)
3. Dans Google Cloud : Authorized redirect URIs → `https://wejuntknwgawpxvamrrs.supabase.co/auth/v1/callback`

## Variables d'environnement Vercel

Le fichier `.env` est commité (clés publiques uniquement) et lu par Vite au build.
Si des variables `VITE_SUPABASE_*` sont définies dans le dashboard Vercel, elles
priment sur `.env` — vérifier qu'elles pointent bien vers le projet actif.
