import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  SlidersHorizontal, LayoutGrid, List, Map, X,
  Search, TrendingUp, ChevronDown,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import ListingCard from '../components/listing/ListingCard';
import AlgeriaMap from '../components/map/AlgeriaMap';
import Pagination from '../components/ui/Pagination';
import { CATEGORIES, getCategoryById } from '../data/categories';
import { WILAYAS } from '../data/wilayas';
import { filterAndSort } from '../services/RankingService';
import type { SearchFilters } from '../types';

const PER_PAGE = 24;

const SearchPage: React.FC = () => {
  const { t, language }                       = useLanguage();
  const { listings }                           = useApp();
  const [searchParams, setSearchParams]        = useSearchParams();
  const [page,        setPage]                = useState(1);
  const [viewMode,    setViewMode]            = useState<'grid' | 'list'>('grid');
  const [showMap,     setShowMap]             = useState(false);
  const [showFilters, setShowFilters]         = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    q:          searchParams.get('q')        || '',
    categoryId: searchParams.get('category') || '',
    wilayaId:   searchParams.get('wilaya')   || '',
    sort:       (searchParams.get('sort') as any) || 'relevance',
    priceMin:   searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : undefined,
    priceMax:   searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
  });

  const activeCategory = getCategoryById(filters.categoryId || '');

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [filters]);

  // Sync URL
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
    const p = new URLSearchParams(searchParams);
    const urlKey = key === 'categoryId' ? 'category' : key === 'wilayaId' ? 'wilaya' : key;
    if (value) p.set(urlKey, String(value));
    else p.delete(urlKey);
    setSearchParams(p, { replace: true });
  };

  const resetAll = () => {
    setFilters({ sort: 'relevance' });
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const allResults = useMemo(() => filterAndSort(listings, filters), [listings, filters]);

  // Pagination
  const totalResults = allResults.length;
  const paginated    = useMemo(() =>
    allResults.slice((page - 1) * PER_PAGE, page * PER_PAGE),
  [allResults, page]);

  // Listing counts per wilaya for map density
  const listingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allResults.forEach(l => {
      if (l.wilayaId) counts[l.wilayaId] = (counts[l.wilayaId] || 0) + 1;
    });
    return counts;
  }, [allResults]);

  const catName = (cat: typeof CATEGORIES[0]) =>
    language === 'ar' ? cat.nameAr : language === 'en' ? cat.nameEn : cat.nameFr;

  const wilayaName = (code: string) => {
    const w = WILAYAS.find(x => x.code === code);
    return w ? (language === 'ar' ? w.nameAr : language === 'en' ? w.nameEn : w.nameFr) : code;
  };

  const activeFiltersCount = [
    filters.q, filters.wilayaId, filters.categoryId,
    filters.priceMin, filters.priceMax,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-muted/30">

      {/* ── Sticky search bar ── */}
      <div className="bg-card border-b border-border sticky top-[54px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2.5">

          {/* Row 1: search input + controls */}
          <div className="flex gap-2 items-center">
            {/* Search */}
            <div className="flex-1 relative max-w-xl">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden/>
              <input
                type="text"
                value={filters.q || ''}
                onChange={e => updateFilter('q', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setPage(1)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:border-dz-green transition-all"
                aria-label="Rechercher des annonces"
              />
            </div>

            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${showFilters ? 'bg-dz-green text-white border-dz-green' : 'bg-background border-border hover:bg-muted'}`}
              aria-expanded={showFilters}
            >
              <SlidersHorizontal size={14}/>
              <span className="hidden sm:inline">{t.filters}</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-dz-red text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative hidden sm:block">
              <select
                value={filters.sort || 'relevance'}
                onChange={e => updateFilter('sort', e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm font-semibold outline-none cursor-pointer focus:border-dz-green"
                aria-label="Trier par"
              >
                <option value="relevance">Pertinence</option>
                <option value="date">Plus récent</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="trust">Vendeur fiable</option>
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
            </div>

            {/* View toggle */}
            <div className="flex bg-muted rounded-xl p-1 gap-0.5" role="group" aria-label="Mode d'affichage">
              {[['grid', LayoutGrid], ['list', List]].map(([mode, Icon]) => (
                <button key={mode as string}
                  onClick={() => setViewMode(mode as 'grid' | 'list')}
                  aria-pressed={viewMode === mode}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === mode ? 'bg-card shadow-sm text-dz-green' : 'text-muted-foreground'}`}>
                  <Icon size={15}/>
                </button>
              ))}
            </div>

            {/* Map toggle */}
            <button
              onClick={() => setShowMap(!showMap)}
              aria-pressed={showMap}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${showMap ? 'bg-dz-green text-white border-dz-green' : 'bg-background border-border hover:bg-muted'}`}>
              <Map size={14}/>
              Carte
            </button>
          </div>

          {/* Row 2: category pills */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5" role="list" aria-label="Filtrer par catégorie">
            <button
              onClick={() => updateFilter('categoryId', '')}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all border ${!filters.categoryId ? 'bg-foreground text-background border-foreground' : 'bg-background border-border text-muted-foreground hover:bg-muted'}`}>
              {language === 'ar' ? 'الكل' : 'Toutes'}
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => updateFilter('categoryId', filters.categoryId === cat.id ? '' : cat.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                  filters.categoryId === cat.id
                    ? 'text-white border-transparent'
                    : 'bg-background border-border text-muted-foreground hover:bg-muted'
                }`}
                style={filters.categoryId === cat.id ? { background: cat.color } : {}}>
                <span>{cat.icon}</span>
                <span>{catName(cat)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filters panel ── */}
      {showFilters && (
        <div className="bg-card border-b border-border shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Wilaya */}
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Wilaya
                </label>
                <select
                  value={filters.wilayaId || ''}
                  onChange={e => updateFilter('wilayaId', e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-dz-green cursor-pointer"
                >
                  <option value="">{t.allAlgeria}</option>
                  {WILAYAS.map(w => (
                    <option key={w.code} value={w.code}>
                      {language === 'ar' ? w.nameAr : language === 'en' ? w.nameEn : w.nameFr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prix min */}
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Prix min (DA)
                </label>
                <input
                  type="number" min="0" step="10000"
                  value={filters.priceMin || ''}
                  onChange={e => updateFilter('priceMin', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0"
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-dz-green"
                />
              </div>

              {/* Prix max */}
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Prix max (DA)
                </label>
                <input
                  type="number" min="0" step="10000"
                  value={filters.priceMax || ''}
                  onChange={e => updateFilter('priceMax', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Illimité"
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-dz-green"
                />
              </div>

              {/* Sort (mobile) + Reset */}
              <div className="flex flex-col justify-end gap-2">
                <select
                  value={filters.sort || 'relevance'}
                  onChange={e => updateFilter('sort', e.target.value)}
                  className="sm:hidden bg-muted border border-border rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer"
                >
                  <option value="relevance">Pertinence</option>
                  <option value="date">Plus récent</option>
                  <option value="price_asc">Prix ↑</option>
                  <option value="price_desc">Prix ↓</option>
                </select>
                <button
                  onClick={resetAll}
                  className="w-full py-2.5 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
                >
                  <X size={14}/> Réinitialiser
                </button>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                {filters.q && (
                  <span className="flex items-center gap-1.5 bg-dz-green/10 text-dz-green text-xs font-bold px-3 py-1 rounded-full border border-dz-green/20">
                    🔍 {filters.q}
                    <button onClick={() => updateFilter('q', '')}><X size={11}/></button>
                  </span>
                )}
                {filters.wilayaId && (
                  <span className="flex items-center gap-1.5 bg-dz-green/10 text-dz-green text-xs font-bold px-3 py-1 rounded-full border border-dz-green/20">
                    📍 {wilayaName(filters.wilayaId)}
                    <button onClick={() => updateFilter('wilayaId', '')}><X size={11}/></button>
                  </span>
                )}
                {filters.priceMin && (
                  <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">
                    ≥ {Number(filters.priceMin).toLocaleString()} DA
                    <button onClick={() => updateFilter('priceMin', undefined)}><X size={11}/></button>
                  </span>
                )}
                {filters.priceMax && (
                  <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">
                    ≤ {Number(filters.priceMax).toLocaleString()} DA
                    <button onClick={() => updateFilter('priceMax', undefined)}><X size={11}/></button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex gap-6">

          {/* Results */}
          <main className="flex-1 min-w-0">
            {/* Result count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-black text-foreground text-base">{totalResults.toLocaleString()}</span>{' '}
                annonce{totalResults !== 1 ? 's' : ''}
                {filters.categoryId && activeCategory && (
                  <span className="ml-1 text-dz-green font-semibold">· {catName(activeCategory)}</span>
                )}
                {filters.wilayaId && (
                  <span className="ml-1 text-dz-green font-semibold">· {wilayaName(filters.wilayaId)}</span>
                )}
              </p>
              {totalResults > 0 && (
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Page {page} · {Math.min(page * PER_PAGE, totalResults)} / {totalResults}
                </p>
              )}
            </div>

            {/* Empty state */}
            {totalResults === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-3xl border border-border">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-black text-foreground mb-2">Aucune annonce trouvée</h3>
                <p className="text-muted-foreground mb-6 max-w-xs leading-relaxed">
                  Essayez avec des mots-clés différents ou modifiez vos filtres.
                </p>
                <button onClick={resetAll}
                  className="px-6 py-2.5 bg-dz-green text-white font-bold rounded-xl shadow-brand-sm hover:bg-dz-green2 transition-colors">
                  Effacer les filtres
                </button>
              </div>
            ) : (
              <>
                {/* Grid/List */}
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                    : 'flex flex-col gap-3'
                }>
                  {paginated.map(l => (
                    <ListingCard key={l.id} listing={l} layout={viewMode === 'list' ? 'list' : 'grid'}/>
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  current={page}
                  total={totalResults}
                  perPage={PER_PAGE}
                  onChange={setPage}
                />
              </>
            )}
          </main>

          {/* Map panel */}
          {showMap && (
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-[160px] bg-card border border-border rounded-2xl p-4 shadow-card">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                  {t.searchByRegion}
                </p>
                <AlgeriaMap
                  compact
                  selectedWilaya={filters.wilayaId}
                  listingCounts={listingCounts}
                  onSelectWilaya={(code) => updateFilter('wilayaId', filters.wilayaId === code ? '' : code)}
                  className="w-full aspect-[480/560]"
                />
                {filters.wilayaId && (
                  <button
                    onClick={() => updateFilter('wilayaId', '')}
                    className="w-full mt-2 text-xs text-dz-green font-bold hover:underline"
                  >
                    ✕ Retirer le filtre wilaya
                  </button>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
