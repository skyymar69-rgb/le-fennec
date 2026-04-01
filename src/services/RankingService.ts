import type { Listing, SearchFilters } from '../types';

const NOW = Date.now();

const WEIGHTS = {
  RELEVANCE: 0.35,
  TRUST:     0.25,
  FRESHNESS: 0.15,
  QUALITY:   0.15,
  BEHAVIOR:  0.10,
};

export function scoreListingForQuery(listing: Listing, query = ''): number {
  const ageH = (NOW - listing.timestamp) / 3_600_000;
  const freshness = 100 * Math.exp(-0.008 * ageH);

  let relevance = 50;
  if (query) {
    const q   = query.toLowerCase();
    const title = listing.title.toLowerCase();
    const cat   = listing.category.toLowerCase();
    const loc   = listing.location.toLowerCase();
    const desc  = (listing.description || '').toLowerCase();

    if (title.includes(q))  relevance = 100;
    else if (desc.includes(q)) relevance = 80;
    else if (cat.includes(q))  relevance = 65;
    else if (loc.includes(q))  relevance = 40;

    // Partial word matching bonus
    const words = q.split(/\s+/).filter(Boolean);
    if (words.length > 1) {
      const matched = words.filter(w => title.includes(w) || desc.includes(w)).length;
      relevance = Math.max(relevance, (matched / words.length) * 90);
    }
  }

  const behavior = Math.min((listing.ranking.clickRate || 0) * 600, 100);

  let score =
    relevance                       * WEIGHTS.RELEVANCE +
    listing.ranking.trustScore      * WEIGHTS.TRUST     +
    freshness                       * WEIGHTS.FRESHNESS +
    listing.ranking.qualityScore    * WEIGHTS.QUALITY   +
    behavior                        * WEIGHTS.BEHAVIOR;

  // Boost multipliers
  if (listing.ranking.boostLevel === 1) score *= 1.25;
  if (listing.ranking.boostLevel === 2) score *= 1.60;
  if (listing.ranking.boostLevel === 3) score *= 2.00;

  // Bonuses
  if (listing.isVerified) score += 5;
  if (listing.isPremium)  score += 8;
  if (listing.isUrgent)   score += 12;

  return Math.round(score * 100) / 100;
}

export function filterAndSort(listings: Listing[], filters: SearchFilters): Listing[] {
  let result = listings.filter(l => l.status === 'active');

  // Category
  if (filters.categoryId) {
    result = result.filter(l => l.categoryId === filters.categoryId);
  }

  // Wilaya
  if (filters.wilayaId) {
    result = result.filter(l => l.wilayaId === filters.wilayaId);
  }

  // Text query
  if (filters.q) {
    const q = filters.q.toLowerCase();
    result = result.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q) ||
      l.location.toLowerCase().includes(q) ||
      (l.description || '').toLowerCase().includes(q)
    );
  }

  // Price range
  if (filters.priceMin) result = result.filter(l => l.price >= filters.priceMin!);
  if (filters.priceMax) result = result.filter(l => l.price <= filters.priceMax!);

  // Condition
  if (filters.condition) result = result.filter(l => l.condition === filters.condition);

  // Pro seller
  if (filters.isPro) result = result.filter(l => l.isPro);

  // With photo
  if (filters.withPhoto) result = result.filter(l => l.images?.length > 0);

  // Dynamic attributes
  if (filters.dynamic) {
    Object.entries(filters.dynamic).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        result = result.filter(l => {
          const attr = l.attributes?.[key];
          return attr !== undefined && String(attr).includes(String(val));
        });
      }
    });
  }

  // Sort
  switch (filters.sort) {
    case 'date':
      return result.sort((a, b) => b.timestamp - a.timestamp);
    case 'price_asc':
      return result.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return result.sort((a, b) => b.price - a.price);
    case 'trust':
      return result.sort((a, b) => b.ranking.trustScore - a.ranking.trustScore);
    default: // relevance
      return result
        .map(l => ({ ...l, _score: scoreListingForQuery(l, filters.q) }))
        .sort((a, b) => {
          // Urgent first within same score range
          if (a.isUrgent && !b.isUrgent) return -1;
          if (!a.isUrgent && b.isUrgent) return 1;
          return (b as any)._score - (a as any)._score;
        });
  }
}

export function computeQualityScore(form: {
  title: string;
  description: string;
  price: string;
  location: string;
  images: string[];
  attributes?: Record<string, unknown>;
}): number {
  let score = 0;
  if (form.title.length > 10)  score += 15;
  if (form.title.length > 25)  score += 10;
  if (form.price)               score += 10;
  if (form.location)            score += 10;
  if (form.description.length > 50)  score += 15;
  if (form.description.length > 150) score += 10;
  if (form.images.length >= 1) score += 10;
  if (form.images.length >= 3) score += 10;
  if (form.images.length >= 5) score += 5;
  if (form.attributes && Object.values(form.attributes).filter(Boolean).length >= 3) score += 5;
  return Math.min(score, 100);
}
