import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, LayoutGrid, List, Map, X, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import ListingCard from '../components/listing/ListingCard';
import AlgeriaMap from '../components/map/AlgeriaMap';
import SmartSearchBar from '../components/ui/SmartSearchBar';
import { CATEGORIES, getCategoryById } from '../data/categories';
import { WILAYAS } from '../data/wilayas';
import { filterAndSort } from '../services/RankingService';
import type { SearchFilters } from '../types';

const SearchPage: React.FC = () => {
  const { t, language }        = useLanguage();
  const { listings }            = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<SearchFilters>({
    q:          searchParams.get('q')        || '',
    categoryId: searchParams.get('category') || '',
    wilayaId:   searchParams.get('wilaya')   || '',
    sort:       (searchParams.get('sort') as any) || 'relevance',
    priceMax:   searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
  });

  const [viewMode,     setViewMode]     = useState<'grid' | 'list'>('grid');
  const [showMap,      setShowMap]      = useState(false);
  const [showFilters,  setShowFilters]  = useState(false);
  const [dynValues,    setDynValues]    = useState<Record<string, string>>({});

  const activeCategory = getCategoryById(filters.categoryId || '');

  // Sync URL → state
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      q:          searchParams.get('q')        || '',
      categoryId: searchParams.get('category') || '',
      wilayaId:   searchParams.get('wilaya')   || '',
    }));
  }, [searchParams]);

  // Apply dynamic filters
  const filtersWithDyn: SearchFilters = useMemo(() => ({
    ...filters,
    dynamic: Object.fromEntries(
      Object.entries(dynValues).filter(([, v]) => v !== '')
    ),
  }), [filters, dynValues]);

  const results = useMemo(() => filterAndSort(listings, filtersWithDyn), [listings, filtersWithDyn]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key === 'categoryId' ? 'category' : key === 'wilayaId' ? 'wilaya' : key, String(value));
    else       newParams.delete(key === 'categoryId' ? 'category' : key === 'wilayaId' ? 'wilaya' : key);
    setSearchParams(newParams, { replace: true });
  };

  const resetAll = () => {
    setFilters({ q: '', sort: 'relevance' });
    setDynValues({});
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const catName = (cat: (typeof CATEGORIES)[0]) =>
    language === 'ar' ? cat.nameAr : language === 'en' ? cat.nameEn : cat.nameFr;

  const wilayaName = (code: string) => {
    const w = WILAYAS.find(x => x.code === code);
    if (!w) return code;
    return language === 'ar' ? w.nameAr : language === 'en' ? w.nameEn : w.nameFr;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Search bar strip ── */}
      <div className="bg-card border-b border-border sticky top-[56px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 max-w-xl">
              <SmartSearchBar isCompact defaultQuery={filters.q} onSearch={(q) => updateFilter('q', q)} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Filters toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-all
                  ${showFilters ? 'bg-dz-green text-white border-dz-green' : 'bg-background border-border text-foreground hover:bg-muted'}`}
              >
                <SlidersHorizontal size={14} />
                {t.filters}
              </button>
              {/* Sort */}
              <select
                value={filters.sort || 'relevance'}
                onChange={e => updateFilter('sort', e.target.value)}
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm font-semibold text-foreground outline-none cursor-pointer"
              >
                <option value="relevance">{t.sortRelevance}</option>
                <option value="date">{t.sortDate}</option>
                <option value="price_asc">{t.sortPriceAsc}</option>
                <option value="price_desc">{t.sortPriceDesc}</option>
                <option value="trust">{t.sortTrust}</option>
              </select>
              {/* View toggle */}
              <div className="flex bg-muted rounded-xl p-1 gap-0.5">
                <button onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-card shadow-sm text-dz-green' : 'text-muted-foreground'}`}>
                  <LayoutGrid size={15} />
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-card shadow-sm text-dz-green' : 'text-muted-foreground'}`}>
                  <List size={15} />
                </button>
              </div>
              {/* Map toggle */}
              <button
                onClick={() => setShowMap(!showMap)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-all
                  ${showMap ? 'bg-dz-green text-white border-dz-green' : 'bg-background border-border text-foreground hover:bg-muted'}`}
              >
                <Map size={14} />
                <span className="hidden sm:inline">{t.mapView}</span>
              </button>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pb-0.5">
            <button
              onClick={() => updateFilter('categoryId', '')}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all border
                ${!filters.categoryId ? 'bg-foreground text-background border-foreground' : 'bg-background border-border text-muted-foreground hover:bg-muted'}`}
            >
              {language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Toutes'}
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { updateFilter('categoryId', filters.categoryId === cat.id ? '' : cat.id); setDynValues({}); }}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border
                  ${filters.categoryId === cat.id ? 'text-white border-transparent' : 'bg-background border-border text-muted-foreground hover:bg-muted'}`}
                style={filters.categoryId === cat.id ? { background: cat.color } : {}}
              >
                <span>{cat.icon}</span>
                {catName(cat)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex gap-6 py-5 pb-24 md:pb-6">

          {/* ── Sidebar filters ── */}
          {showFilters && (
            <aside className="w-64 shrink-0 hidden md:block space-y-5">
              <div className="sticky top-[160px] space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground text-sm">{t.filters}</span>
                  <button onClick={resetAll} className="text-xs text-dz-green hover:underline font-semibold">{t.reset}</button>
                </div>

                {/* Price range */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-2">{t.price}</label>
                  <input
                    type="range" min="0" max="100000000" step="500000"
                    value={filters.priceMax ?? 100000000}
                    onChange={e => updateFilter('priceMax', Number(e.target.value))}
                    className="w-full accent-dz-green"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span className="font-bold text-dz-green">
                      {(filters.priceMax ?? 100000000).toLocaleString('fr-DZ')} DA
                    </span>
                  </div>
                </div>

                {/* Wilaya */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-2">
                    {language === 'ar' ? 'الولاية' : 'Wilaya'}
                  </label>
                  <select
                    value={filters.wilayaId || ''}
                    onChange={e => updateFilter('wilayaId', e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none cursor-pointer"
                  >
                    <option value="">{t.allAlgeria}</option>
                    {WILAYAS.map(w => (
                      <option key={w.code} value={w.code}>
                        {language === 'ar' ? w.nameAr : language === 'en' ? w.nameEn : w.nameFr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic filters by category */}
                {activeCategory?.filters?.map(f => (
                  <div key={f.id}>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-2">
                      {language === 'ar' ? f.labelAr : language === 'en' ? f.labelEn : f.labelFr}
                    </label>
                    {f.type === 'select' ? (
                      <select
                        value={dynValues[f.id] || ''}
                        onChange={e => setDynValues(prev => ({ ...prev, [f.id]: e.target.value }))}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none cursor-pointer"
                      >
                        <option value="">
                          {language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Tous'}
                        </option>
                        {f.options?.map(opt => (
                          <option key={String(opt.value)} value={String(opt.value)}>
                            {language === 'ar' ? opt.labelAr : language === 'en' ? opt.labelEn : opt.labelFr}
                          </option>
                        ))}
                      </select>
                    ) : f.type === 'number' ? (
                      <input
                        type="number" placeholder={f.placeholder}
                        value={dynValues[f.id] || ''}
                        onChange={e => setDynValues(prev => ({ ...prev, [f.id]: e.target.value }))}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none"
                      />
                    ) : null}
                  </div>
                ))}

                {/* With photo */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!filters.withPhoto}
                    onChange={e => updateFilter('withPhoto', e.target.checked)}
                    className="rounded accent-dz-green"
                  />
                  <span className="text-sm text-foreground">
                    {language === 'ar' ? 'بصور فقط' : language === 'en' ? 'With photo only' : 'Avec photo uniquement'}
                  </span>
                </label>

                {/* Apply (mobile) */}
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full py-2.5 bg-dz-green text-white font-bold rounded-xl text-sm hidden"
                >
                  {t.apply}
                </button>
              </div>
            </aside>
          )}

          {/* ── Results ── */}
          <main className="flex-1 min-w-0">
            {/* Active filters chips */}
            {(filters.q || filters.wilayaId || filters.categoryId || filters.priceMax) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.q && (
                  <span className="flex items-center gap-1 bg-dz-green/10 text-dz-green text-xs font-semibold px-3 py-1.5 rounded-full border border-dz-green/20">
                    🔍 {filters.q}
                    <button onClick={() => updateFilter('q', '')}><X size={12} /></button>
                  </span>
                )}
                {filters.wilayaId && (
                  <span className="flex items-center gap-1 bg-dz-green/10 text-dz-green text-xs font-semibold px-3 py-1.5 rounded-full border border-dz-green/20">
                    📍 {wilayaName(filters.wilayaId)}
                    <button onClick={() => updateFilter('wilayaId', '')}><X size={12} /></button>
                  </span>
                )}
                <button onClick={resetAll} className="text-xs text-dz-red hover:underline font-semibold px-2">
                  {t.reset}
                </button>
              </div>
            )}

            {/* Result count */}
            <p className="text-sm text-muted-foreground mb-4 font-medium">
              <span className="font-black text-foreground">{results.length}</span> {t.results}
            </p>

            {/* Empty state */}
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-foreground mb-2">{t.noResults}</h3>
                <p className="text-muted-foreground mb-6 max-w-xs">
                  {language === 'ar' ? 'جرب تعديل فلاترك أو توسيع نطاق بحثك'
                    : language === 'en' ? 'Try adjusting your filters or broadening your search'
                    : 'Essayez de modifier vos filtres ou d\'élargir votre recherche'}
                </p>
                <button onClick={resetAll}
                  className="px-6 py-2.5 bg-dz-green text-white font-bold rounded-xl text-sm shadow-brand-sm">
                  {t.reset}
                </button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                  : 'flex flex-col gap-3'
              }>
                {results.map(l => (
                  <ListingCard key={l.id} listing={l} layout={viewMode === 'list' ? 'list' : 'grid'} />
                ))}
              </div>
            )}
          </main>

          {/* ── Map panel ── */}
          {showMap && (
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-[160px] bg-card border border-border rounded-2xl p-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">{t.searchByRegion}</p>
                <AlgeriaMap
                  compact
                  selectedWilaya={filters.wilayaId}
                  onSelectWilaya={(code) => updateFilter('wilayaId', code)}
                  className="w-full aspect-[5/6]"
                />
                <div className="mt-3 space-y-1">
                  {WILAYAS.filter(w => ['16','31','25','23','09'].includes(w.code)).map(w => (
                    <button key={w.code}
                      onClick={() => updateFilter('wilayaId', w.code)}
                      className={`w-full flex justify-between items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                        ${filters.wilayaId === w.code ? 'bg-dz-green text-white' : 'hover:bg-muted text-foreground'}`}
                    >
                      <span>{language === 'ar' ? w.nameAr : language === 'en' ? w.nameEn : w.nameFr}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Mobile filters overlay */}
      {showFilters && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40 flex items-end" onClick={() => setShowFilters(false)}>
          <div className="bg-card w-full rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-5">
              <h3 className="font-bold text-lg">{t.filters}</h3>
              <button onClick={() => setShowFilters(false)}><X size={20} /></button>
            </div>
            {/* Price */}
            <div className="mb-5">
              <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">{t.price}</label>
              <input type="range" min="0" max="100000000" step="500000"
                value={filters.priceMax ?? 100000000}
                onChange={e => updateFilter('priceMax', Number(e.target.value))}
                className="w-full accent-dz-green" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span className="font-bold text-dz-green">{(filters.priceMax ?? 100000000).toLocaleString()} DA</span>
              </div>
            </div>
            {/* Wilaya */}
            <div className="mb-5">
              <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Wilaya</label>
              <select value={filters.wilayaId || ''}
                onChange={e => updateFilter('wilayaId', e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none">
                <option value="">{t.allAlgeria}</option>
                {WILAYAS.map(w => (
                  <option key={w.code} value={w.code}>{language === 'ar' ? w.nameAr : w.nameFr}</option>
                ))}
              </select>
            </div>
            <button onClick={() => setShowFilters(false)}
              className="w-full py-3 bg-dz-green text-white font-bold rounded-xl shadow-brand-sm">
              {t.apply} ({results.length} {t.results})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
