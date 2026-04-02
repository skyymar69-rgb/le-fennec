import { useState, useCallback, useRef } from 'react';

const ENDPOINT = 'https://api.anthropic.com/v1/messages';
const MODEL    = 'claude-sonnet-4-20250514';
const API_KEY  = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

interface Suggestion {
  title:       string;
  description: string;
  price?:      number;
  priceMin?:   number;
  priceMax?:   number;
  tips?:       string[];
}

export function useAISuggestions() {
  const [loading,    setLoading]    = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const suggest = useCallback(async (
    category: string,
    attributes: Record<string, string>,
    existing: { title?: string; description?: string }
  ) => {
    if (!API_KEY) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const attrsStr = Object.entries(attributes)
          .filter(([, v]) => v)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');

        const prompt = `Tu es un expert des petites annonces algériennes.
Génère une suggestion d'annonce pour la catégorie "${category}" avec ces caractéristiques : ${attrsStr || 'non précisées'}.
${existing.title ? `Titre actuel : "${existing.title}"` : ''}

Réponds UNIQUEMENT en JSON :
{
  "title": "Titre accrocheur de 60 chars max (inclure marque/modèle/état clé)",
  "description": "Description détaillée 150-250 mots, style annonce professionnelle algérienne, inclure état, points forts, raison vente",
  "price": prix_suggéré_en_DA_entier,
  "priceMin": prix_min_marché_DA,
  "priceMax": prix_max_marché_DA,
  "tips": ["conseil1 court", "conseil2 court", "conseil3 court"]
}`;

        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key':    API_KEY,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model:      MODEL,
            max_tokens: 800,
            messages:   [{ role: 'user', content: prompt }],
          }),
        });

        if (!res.ok) return;
        const data = await res.json();
        const text = data.content?.[0]?.text || '';
        const json = JSON.parse(text.replace(/```json|```/g, '').trim());
        setSuggestion(json);
      } catch {}
      setLoading(false);
    }, 1000);
  }, []);

  const clear = () => setSuggestion(null);

  return { loading, suggestion, suggest, clear };
}
