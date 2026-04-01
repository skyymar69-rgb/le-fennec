# 🦊 Le Fennec — Petites annonces gratuites en Algérie

Plateforme de référence pour les petites annonces en Algérie.
React + TypeScript + Vite + Tailwind + Claude AI.

---

## 🚀 Déploiement Railway (1-click)

### Option A — Via GitHub (recommandé)

1. **Pusher sur GitHub**
   ```bash
   git init
   git add .
   git commit -m "feat: initial Le Fennec"
   git remote add origin https://github.com/TON_USER/le-fennec.git
   git push -u origin main
   ```

2. **Sur Railway** → New Project → Deploy from GitHub → sélectionner le repo

3. **Variables d'environnement** → Settings → Variables :
   ```
   VITE_ANTHROPIC_API_KEY = sk-ant-xxxxxxxx
   ```

4. **Railway détecte automatiquement** le `nixpacks.toml` et déploie.

### Option B — Railway CLI

```bash
npm install -g @railway/cli
railway login
railway init
railway up
railway variables set VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx
```

---

## 💻 Développement local

```bash
# Installer les dépendances
npm install

# Créer le fichier env local
cp .env.example .env.local
# Éditer .env.local avec votre clé Anthropic

# Lancer le dev server
npm run dev
# → http://localhost:5173
```

---

## 🏗️ Structure du projet

```
src/
├── components/
│   ├── layout/        Header, Footer, BottomNav mobile
│   ├── listing/       ListingCard
│   ├── map/           AlgeriaMap (58 wilayas SVG d3-geo)
│   └── ui/            Logo, ThemeSwitcher, LanguageSwitcher, SmartSearchBar
├── contexts/
│   ├── AppContext      État global (auth, listings, favoris, messages)
│   ├── ThemeContext    Dark / Light mode
│   └── LanguageContext FR 🇫🇷 / AR 🇩🇿 / EN 🇬🇧 + RTL
├── data/
│   ├── categories.ts   11 catégories + filtres dynamiques
│   ├── wilayas.ts      58 wilayas d'Algérie
│   └── wilayaPaths.ts  Paths SVG générés par d3-geo (auto)
├── i18n/               Traductions complètes FR / AR / EN
├── pages/
│   ├── HomePage        Hero + carte + catégories + listings
│   ├── SearchPage      Filtres + tri + vue carte
│   ├── ListingDetailPage Carrousel photos + contact
│   ├── PostAdPage      Wizard 6 étapes avec IA
│   ├── AuthPage        Social login + email
│   ├── DashboardPage   Mes annonces + stats + paramètres
│   ├── MessagesPage    Messagerie temps réel
│   ├── FavoritesPage   Annonces sauvegardées
│   └── LegalPage       CGU / Confidentialité trilingues
├── services/
│   ├── AIService.ts    Claude API (suggestions, amélioration, prix)
│   └── RankingService  Algorithme de scoring multi-critères
└── types/              Types TypeScript stricts
```

---

## 🌍 Internationalisation

- **Français** 🇫🇷 — Langue par défaut
- **Arabe** 🇩🇿 — Avec RTL automatique + police Cairo
- **Anglais** 🇬🇧 — Complet

Sélecteur de langue dans le header avec drapeaux.

---

## 🗺️ Carte Algérie

58 wilayas avec paths SVG réels générés via **d3-geo** (projection Mercator).
Pour re-générer depuis le GeoJSON officiel :
```bash
# Récupérer le GeoJSON officiel (depuis un réseau non restreint)
# curl https://raw.githubusercontent.com/fr33dz/Algeria-geojson/master/dza.geojson > src/assets/dza.geojson
node gen_paths.cjs   # régénère src/data/wilayaPaths.ts
```

---

## 🤖 IA (Claude API)

Fonctionnalités nécessitant `VITE_ANTHROPIC_API_KEY` :
- **Recherche intelligente** — suggestions contextuelles
- **Amélioration d'annonce** — titre + description optimisés
- **Estimation de prix** — selon le marché algérien
- **Parsing d'intention** — extrait catégorie/wilaya/prix de la recherche

Sans clé API, les fonctionnalités IA sont désactivées silencieusement.

---

## 🎨 Design System

- Couleurs : drapeau algérien `#006233` (vert) + `#D21034` (rouge)
- Polices : Inter (latin) + Cairo (arabe)
- Dark mode complet avec transition fluide
- Mobile-first + bottom navigation

---

## 🔄 Adapter pour d'autres pays Maghreb/Machrek

1. Remplacer `src/assets/dza.geojson` par le GeoJSON du pays
2. Mettre à jour `src/data/wilayas.ts` avec les wilayas/gouvernorats
3. Relancer `node gen_paths.cjs`
4. Adapter les couleurs dans `src/index.css` (`--dz-green`, `--dz-red`)
5. Modifier le logo dans `public/assets/logo.png`

---

**© 2025 Le Fennec · 🇩🇿 Made in Algeria · Propulsé par Claude AI**
