# Le Fennec — Activation Supabase

## Option 1 : Script automatique (recommandé)

1. Ouvre [le-fennec-birs.vercel.app/setup](https://le-fennec-birs.vercel.app/setup)
2. Clique "Lancer la configuration"

## Option 2 : SQL Editor Supabase

1. Va sur https://supabase.com/dashboard/project/eubqfxedbxsdcvvzwqzp/sql/new
2. Copie-colle le contenu de `supabase_schema.sql`
3. Clique "Run"

## Activer Google OAuth

1. Supabase Dashboard → Authentication → Providers → Google
2. Ajoute ton Client ID + Secret (Google Cloud Console)
3. Dans Google Cloud : Authorized redirect URIs → `https://eubqfxedbxsdcvvzwqzp.supabase.co/auth/v1/callback`

## Variables d'environnement Vercel

Déjà configurées automatiquement :
- `VITE_SUPABASE_URL` = https://eubqfxedbxsdcvvzwqzp.supabase.co
- `VITE_SUPABASE_ANON_KEY` = (configurée dans .env)
