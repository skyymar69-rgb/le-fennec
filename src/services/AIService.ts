/**
 * AIService — Intégration Claude API pour Le Fennec
 * La clé API est injectée via la variable d'environnement VITE_ANTHROPIC_API_KEY
 * En développement: créer .env.local avec VITE_ANTHROPIC_API_KEY=sk-ant-...
 * Sur Railway: ajouter la variable dans les paramètres du service
 */

const ENDPOINT  = 'https://api.anthropic.com/v1/messages';
const MODEL     = 'claude-sonnet-4-20250514';
const API_KEY   = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

// ─── Core helper ──────────────────────────────────────────────

async function callClaude(userPrompt: string, systemPrompt: string, maxTokens = 800): Promise<string> {
  if (!API_KEY) {
    console.warn('[AIService] VITE_ANTHROPIC_API_KEY non définie — IA désactivée');
    throw new Error('API_KEY_MISSING');
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type':         'application/json',
      'x-api-key':            API_KEY,
      'anthropic-version':    '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: maxTokens,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) throw new Error(`Claude API ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

function parseJSON<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim()) as T;
  } catch {
    return fallback;
  }
}

// ─── 1. Suggestions de recherche ──────────────────────────────

export interface SearchSuggestion {
  text:     string;
  category: string;
  type:     'keyword' | 'location' | 'category' | 'brand';
  icon?:    string;
}

export async function getSearchSuggestions(query: string, lang = 'fr'): Promise<SearchSuggestion[]> {
  const fallback: SearchSuggestion[] = [
    { text: `${query} Alger`,    category: 'Localisation', type: 'location', icon: '📍' },
    { text: `${query} neuf`,     category: 'État',         type: 'keyword',  icon: '✨' },
    { text: `${query} occasion`, category: 'État',         type: 'keyword',  icon: '🏷️' },
  ];
  try {
    const text = await callClaude(
      `Génère 5 suggestions de recherche intelligentes pour "${query}" sur Le Fennec, site d'annonces algérien.
       Langue: ${lang === 'ar' ? 'arabe' : lang === 'en' ? 'anglais' : 'français'}.
       Contexte : Algérie, prix en DA, wilayas algériennes.
       JSON array uniquement (sans markdown): [{"text":"...","category":"...","type":"keyword|location|category|brand","icon":"emoji"}]`,
      'Tu génères des suggestions de recherche pour un site d\'annonces algérien. JSON array uniquement, sans markdown ni preamble.'
    );
    const arr = parseJSON<SearchSuggestion[]>(text, fallback);
    return Array.isArray(arr) ? arr.slice(0, 5) : fallback;
  } catch {
    return fallback;
  }
}

// ─── 2. Amélioration d'annonce ────────────────────────────────

export interface AdImprovement {
  title:       string;
  description: string;
  tip:         string;
  keywords:    string[];
}

export async function improveAd(
  category:    string,
  title:       string,
  description: string,
  price?:      string,
  wilaya?:     string,
  lang = 'fr'
): Promise<AdImprovement> {
  const fallback: AdImprovement = {
    title:       title + (title.includes('état') ? '' : ' — Très bon état'),
    description: description + '\n\nArticle garanti authentique. Contact sérieux uniquement.',
    tip:         'Ajoutez 3 photos minimum pour multiplier les contacts par 2.',
    keywords:    [category, wilaya || 'Algérie'],
  };
  try {
    const text = await callClaude(
      `Améliore ce titre et génère une description pro pour une annonce sur Le Fennec (Algérie).
       Catégorie: ${category} | Titre: "${title}" | Description: "${description}"
       ${price ? `Prix: ${price} DA` : ''} ${wilaya ? `Wilaya: ${wilaya}` : ''}
       Langue: ${lang}
       SEO: titre percutant, description structurée, mots-clés naturels, marché algérien.
       JSON uniquement: {"title":"...","description":"...","tip":"...","keywords":["..."]}`,
      'Tu es expert en rédaction d\'annonces pour le marché algérien. JSON uniquement, sans markdown.'
    );
    return parseJSON<AdImprovement>(text, fallback);
  } catch {
    return fallback;
  }
}

// ─── 3. Estimation de prix ────────────────────────────────────

export interface MarketPrice {
  min:        number;
  max:        number;
  suggested:  number;
  reasoning:  string;
  trend:      'up' | 'stable' | 'down';
  confidence: 'high' | 'medium' | 'low';
}

export async function estimatePrice(
  category:    string,
  title:       string,
  wilaya?:     string,
  attributes?: Record<string, unknown>
): Promise<MarketPrice> {
  const fallback: MarketPrice = {
    min: 50000, max: 200000, suggested: 120000,
    reasoning: 'Estimation basée sur les annonces similaires.',
    trend: 'stable', confidence: 'medium',
  };
  try {
    const text = await callClaude(
      `Estime le prix en dinars algériens (DA) pour cette annonce.
       Catégorie: ${category} | Article: "${title}"
       ${wilaya ? `Wilaya: ${wilaya}` : ''}
       ${attributes ? `Attributs: ${JSON.stringify(attributes)}` : ''}
       Marché algérien 2025 (Ouedkniss, Le Fennec, prix de référence).
       JSON uniquement: {"min":N,"max":N,"suggested":N,"reasoning":"...","trend":"up|stable|down","confidence":"high|medium|low"}`,
      'Expert du marché algérien des petites annonces. Prix en DA. JSON uniquement.'
    );
    return parseJSON<MarketPrice>(text, fallback);
  } catch {
    return fallback;
  }
}

// ─── 4. Parsing d'intention de recherche ─────────────────────

export interface SearchIntent {
  keywords:   string;
  category?:  string;
  wilaya?:    string;
  priceMax?:  number;
  condition?: string;
}

export async function parseSearchIntent(query: string): Promise<SearchIntent> {
  const fallback: SearchIntent = { keywords: query };
  try {
    const text = await callClaude(
      `Analyse cette requête de recherche et extrait les infos structurées.
       Requête: "${query}" — Site d'annonces algérien.
       JSON uniquement: {"keywords":"...","category":"...","wilaya":"...","priceMax":N,"condition":"new|used"}`,
      'Analyse des requêtes de recherche pour site d\'annonces algérien. JSON uniquement.'
    );
    return parseJSON<SearchIntent>(text, fallback);
  } catch {
    return fallback;
  }
}

// ─── 5. Génération de réponse rapide ─────────────────────────

export async function generateReply(listingTitle: string, buyerMessage: string, lang = 'fr'): Promise<string> {
  try {
    return await callClaude(
      `Génère une réponse courtoise pour le vendeur d'une annonce "${listingTitle}".
       Message acheteur: "${buyerMessage}"
       Langue: ${lang}. 2-3 phrases max, ton professionnel et chaleureux.`,
      'Tu aides les vendeurs sur Le Fennec à répondre aux acheteurs. Réponse directe sans JSON.'
    );
  } catch {
    return lang === 'ar'
      ? 'شكرًا على اهتمامك. المقال لا يزال متاحًا. تواصل معي للمزيد.'
      : lang === 'en'
      ? 'Thank you for your interest. The item is still available. Feel free to contact me.'
      : 'Merci pour votre intérêt. Le produit est toujours disponible. N\'hésitez pas à me contacter.';
  }
}
