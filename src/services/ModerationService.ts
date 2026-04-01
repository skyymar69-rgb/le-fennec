/**
 * ModerationService — IA de modération des annonces et images
 * Utilise Claude API (Vision + Text) pour analyser le contenu
 * avant publication.
 *
 * Endpoints simulés:
 *   POST /api/moderate/listing → analyse titre + description
 *   POST /api/moderate/image   → analyse image uploadée
 *
 * En production: déplacer vers un backend serverless (Vercel Edge Functions)
 * pour ne pas exposer la clé API côté client.
 */

const ENDPOINT = 'https://api.anthropic.com/v1/messages';
const MODEL    = 'claude-sonnet-4-20250514';
const API_KEY  = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

// ─── Types ────────────────────────────────────────────────────

export interface ModerationResult {
  approved:   boolean;
  confidence: number;          // 0–1
  reason:     string;          // message explicatif
  category?:  'clean' | 'adult' | 'violence' | 'scam' | 'spam' | 'off-topic' | 'suspicious' | 'dating';
  action?:    'approve' | 'reject' | 'manual_review';
}

export interface ImageModerationResult extends ModerationResult {
  relevanceToCategory: boolean;
  detectedContent:     string;
}

// ─── Rejection patterns (client-side pre-filter) ──────────────

// Patterns always rejected without API call (fast, free)
const SCAM_PATTERNS = [
  /argent\s*facile/i, /travail\s*(à|a)\s*domicile/i, /gagner\s*sans/i,
  /investissement\s*garanti/i, /double\s*votre\s*argent/i, /mlm/i,
  /pyramide/i, /réseaux?\s*marketing/i,
  /rencontre/i, /escort/i, /massage\s*érotique/i, /accompagnatr/i,
  /plan\s*cul/i, /69/i, /x+x+x/i, /porno/i, /adulte/i, /sexy/i,
  /whatsapp\s*only/i, /wa\.me\/\d/i,
  /bitcoin\s*profit/i, /crypto\s*garanti/i, /forex\s*signal/i,
];

const DATING_PATTERNS = [
  /cherche\s*(homme|femme|partenaire|ami)/i, /célibataire/i,
  /sérieux\s*(s'abstenir|only)/i, /plan\s*[a-z]/i,
];

function quickReject(text: string): ModerationResult | null {
  for (const p of SCAM_PATTERNS) {
    if (p.test(text)) return {
      approved: false, confidence: 0.97,
      reason: 'Ce contenu viole nos conditions d\'utilisation (contenu illicite, arnaque ou contenu adulte).',
      category: /rencontre|escort|massage|plan|sexy|escort|adult|porno/.test(p.source) ? 'adult' : 'scam',
      action: 'reject',
    };
  }
  for (const p of DATING_PATTERNS) {
    if (p.test(text)) return {
      approved: false, confidence: 0.92,
      reason: 'Les annonces de rencontre ou de recherche de partenaire ne sont pas autorisées sur Le Fennec.',
      category: 'dating', action: 'reject',
    };
  }
  return null;
}

// ─── Claude API call ──────────────────────────────────────────

async function callClaude(messages: Array<{ role: string; content: any }>, maxTokens = 400): Promise<string> {
  if (!API_KEY) throw new Error('API_KEY_MISSING');

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type':         'application/json',
      'x-api-key':            API_KEY,
      'anthropic-version':    '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages }),
  });

  if (!res.ok) throw new Error(`Claude API ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

function parseResult<T extends ModerationResult>(text: string, fallback: T): T {
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim()) as T;
  } catch {
    return fallback;
  }
}

// ─── 1. Modération texte (titre + description) ────────────────

export async function moderateListing(
  title: string,
  description: string,
  category: string,
  wilaya?: string,
): Promise<ModerationResult> {

  // Fast path: client-side pattern matching
  const quick = quickReject(title + ' ' + description);
  if (quick) return quick;

  // If no API key, approve with medium confidence
  if (!API_KEY) {
    return {
      approved: true, confidence: 0.75,
      reason: 'Modération automatique désactivée (clé API manquante).',
      action: 'approve',
    };
  }

  const fallback: ModerationResult = {
    approved: true, confidence: 0.70,
    reason: 'Annonce approuvée par modération automatique.',
    action: 'approve',
  };

  try {
    const text = await callClaude([{
      role: 'user',
      content: `Tu es le système de modération automatique du site Le Fennec (annonces classées algériennes).
Analyse cette annonce et détermine si elle doit être approuvée, rejetée ou placée en révision manuelle.

Catégorie déclarée: ${category}
Wilaya: ${wilaya || 'Non précisée'}
Titre: "${title}"
Description: "${description}"

Critères de REJET automatique:
- Contenu à caractère sexuel, escort, rencontre ou dating
- Arnaque évidente: MLM, pyramide, "argent facile", investissement garanti
- Spam ou annonce vide/sans sens
- Hors catégorie manifeste (ex: vente de voiture dans "Animaux")

Critères de RÉVISION MANUELLE (score < 0.7):
- Annonce ambiguë ou incomplète
- Description très courte ou suspecte
- Prix anormalement haut ou bas pour la catégorie

Réponds UNIQUEMENT en JSON:
{
  "approved": true/false,
  "confidence": 0.0 à 1.0,
  "reason": "Explication en français (max 100 mots)",
  "category": "clean|adult|violence|scam|spam|off-topic|suspicious|dating",
  "action": "approve|reject|manual_review"
}`,
    }], 300);

    const result = parseResult<ModerationResult>(text, fallback);

    // Force manual review if confidence is between 0.4 and 0.7
    if (result.confidence >= 0.4 && result.confidence < 0.70 && result.approved) {
      return { ...result, action: 'manual_review' };
    }

    return result;
  } catch {
    return fallback;
  }
}

// ─── 2. Modération image (Claude Vision) ─────────────────────

export async function moderateImage(
  imageBase64: string,
  imageMediaType: string,
  category: string,
): Promise<ImageModerationResult> {

  const fallback: ImageModerationResult = {
    approved: true, confidence: 0.65,
    reason: 'Image acceptée (modération IA non disponible).',
    relevanceToCategory: true,
    detectedContent: 'inconnu',
    action: 'approve',
  };

  if (!API_KEY) return fallback;

  // Quick size check (base64 decoded ≈ 3/4 of base64 length)
  if (imageBase64.length > 5_000_000) {
    return {
      approved: false, confidence: 0.99,
      reason: 'Image trop volumineuse. Veuillez utiliser une image de moins de 3.5 Mo.',
      relevanceToCategory: false,
      detectedContent: 'trop grande',
      action: 'reject',
    };
  }

  try {
    const text = await callClaude([{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type:       'base64',
            media_type: imageMediaType as 'image/jpeg' | 'image/png' | 'image/webp',
            data:       imageBase64,
          },
        },
        {
          type: 'text',
          text: `Tu analyses une image soumise pour une annonce classée algérienne.
Catégorie de l'annonce: ${category}

Analyse:
1. L'image contient-elle du contenu adulte, violent ou choquant?
2. L'image est-elle pertinente pour la catégorie "${category}"?
3. S'agit-il d'un selfie, mème, image de réseaux sociaux sans rapport avec l'annonce?

Réponds UNIQUEMENT en JSON:
{
  "approved": true/false,
  "confidence": 0.0 à 1.0,
  "reason": "Explication courte en français",
  "category": "clean|adult|violence|scam|spam|off-topic",
  "relevanceToCategory": true/false,
  "detectedContent": "description de ce qu'il y a sur l'image",
  "action": "approve|reject|manual_review"
}`,
        },
      ],
    }], 300);

    const result = parseResult<ImageModerationResult>(text, fallback);

    // Reject if not relevant to category with high confidence
    if (!result.relevanceToCategory && result.confidence > 0.85) {
      return {
        ...result,
        approved: false,
        reason: `Cette image ne semble pas correspondre à une annonce de type "${category}". Veuillez uploader une photo de l'article à vendre.`,
        action: 'reject',
      };
    }

    return result;
  } catch {
    return fallback;
  }
}

// ─── 3. Score de qualité annonce ──────────────────────────────

export interface QualityFeedback {
  score:       number;           // 0-100
  level:       'excellent' | 'good' | 'average' | 'poor';
  suggestions: string[];
  seoKeywords: string[];
}

export function computeQualityFeedback(opts: {
  title:       string;
  description: string;
  price:       string;
  location:    string;
  images:      string[];
  attributes?: Record<string, unknown>;
}): QualityFeedback {
  let score = 0;
  const suggestions: string[] = [];

  // Title
  if (opts.title.length > 10)  score += 12; else suggestions.push('Titre trop court — ajoutez des détails');
  if (opts.title.length > 30)  score += 8;
  if (opts.title.length > 60)  suggestions.push('Titre trop long — raccourcissez à 60 caractères max');

  // Price
  if (opts.price && parseInt(opts.price) > 0) score += 10;
  else suggestions.push('Ajoutez un prix pour plus de visibilité');

  // Location
  if (opts.location) score += 10;
  else suggestions.push('Précisez la wilaya pour apparaître dans les recherches locales');

  // Description
  if (opts.description.length > 50)  score += 12;
  else suggestions.push('Description trop courte — décrivez l\'état, les caractéristiques');
  if (opts.description.length > 150) score += 8;
  if (opts.description.length > 300) score += 5;

  // Photos
  if (opts.images.length >= 1)  score += 10;
  else suggestions.push('⭐ Ajoutez au moins 1 photo — les annonces avec photo ont 3× plus de contacts');
  if (opts.images.length >= 3)  score += 10;
  else if (opts.images.length > 0) suggestions.push('Ajoutez 3+ photos pour maximiser vos chances');
  if (opts.images.length >= 5)  score += 5;

  // Attributes
  const attrs = opts.attributes;
  if (attrs) {
    const filled = Object.values(attrs).filter(v => v !== '' && v != null && v !== undefined).length;
    if (filled >= 2) score += 5;
    if (filled >= 5) score += 5;
    if (filled < 2)  suggestions.push('Remplissez les caractéristiques spécifiques à la catégorie');
  }

  score = Math.min(score, 100);

  const level: QualityFeedback['level'] =
    score >= 85 ? 'excellent' :
    score >= 65 ? 'good' :
    score >= 40 ? 'average' : 'poor';

  // Generate SEO keywords from title
  const seoKeywords = opts.title
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3)
    .slice(0, 5);

  return { score, level, suggestions, seoKeywords };
}

// ─── 4. Modération batch (en file d'attente) ──────────────────

interface ModerationQueueItem {
  id:        string;
  type:      'listing' | 'image';
  data:      Record<string, string>;
  status:    'pending' | 'approved' | 'rejected' | 'manual_review';
  result?:   ModerationResult;
  createdAt: number;
}

// In-memory queue (replace with DB in production)
const moderationQueue: ModerationQueueItem[] = [];

export function enqueueForModeration(item: Omit<ModerationQueueItem, 'status' | 'createdAt'>): void {
  moderationQueue.push({ ...item, status: 'pending', createdAt: Date.now() });
}

export function getModerationQueue(): ModerationQueueItem[] {
  return moderationQueue;
}

export function resolveModerationItem(id: string, status: 'approved' | 'rejected'): void {
  const item = moderationQueue.find(i => i.id === id);
  if (item) item.status = status;
}
