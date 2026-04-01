import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, X, TrendingUp, Loader2, Bot, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { getSearchSuggestions, parseSearchIntent, SearchSuggestion } from '../../services/AIService';
import { WILAYAS } from '../../data/wilayas';

interface SmartSearchBarProps {
  isCompact?: boolean;
  defaultQuery?: string;
  defaultWilaya?: string;
  onSearch?: (q: string, wilayaId?: string) => void;
}

const TRENDING: SearchSuggestion[] = [
  { text: 'Golf 8',             category: 'Véhicules',  type: 'keyword',  icon: '🚗' },
  { text: 'Appartement F3',     category: 'Immobilier', type: 'keyword',  icon: '🏠' },
  { text: 'iPhone 15 Pro',      category: 'High-Tech',  type: 'keyword',  icon: '📱' },
  { text: 'Toyota Hilux',       category: 'Véhicules',  type: 'keyword',  icon: '🚙' },
  { text: 'MacBook Pro',        category: 'High-Tech',  type: 'keyword',  icon: '💻' },
];

const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  isCompact = false,
  defaultQuery = '',
  defaultWilaya = '',
  onSearch,
}) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [query,     setQuery]     = useState(defaultQuery);
  const [wilaya,    setWilaya]    = useState(defaultWilaya);
  const [focused,   setFocused]   = useState(false);
  const [aiResults, setAiResults] = useState<SearchSuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // AI suggestions debounced
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length > 3) {
      setAiLoading(true);
      debounceRef.current = setTimeout(async () => {
        const results = await getSearchSuggestions(query, language);
        setAiResults(results);
        setAiLoading(false);
      }, 500);
    } else {
      setAiResults([]);
      setAiLoading(false);
    }
    return () => clearTimeout(debounceRef.current);
  }, [query, language]);

  const handleSearch = useCallback((q = query) => {
    if (!q.trim() && !wilaya) return;
    setFocused(false);
    if (onSearch) {
      onSearch(q, wilaya);
    } else {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q);
      if (wilaya)   params.set('wilaya', wilaya);
      navigate(`/search?${params.toString()}`);
    }
  }, [query, wilaya, navigate, onSearch]);

  const handleSelect = (text: string) => {
    setQuery(text);
    handleSearch(text);
  };

  const showTrending   = query.length <= 3;
  const displayResults = showTrending ? TRENDING : aiResults;

  /* ── Compact (header) ──────────────────────────────────────────────── */
  if (isCompact) {
    return (
      <div ref={dropdownRef} className="relative w-full">
        <div
          className={`flex items-center gap-2 h-9 px-3 rounded-full border transition-all
            bg-muted border-border hover:border-primary/40
            focus-within:border-dz-green focus-within:bg-background focus-within:shadow-brand-sm`}
        >
          <Search size={14} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={t.searchPlaceholder}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground min-w-0"
            autoComplete="off"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-0.5 hover:bg-muted rounded-full">
              <X size={12} className="text-muted-foreground" />
            </button>
          )}
        </div>

        {focused && (
          <div className="absolute top-full mt-2 left-0 w-[180%] -translate-x-[15%] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-up">
            <SearchDropdown
              results={displayResults}
              aiLoading={aiLoading}
              showTrending={showTrending}
              onSelect={handleSelect}
              t={t}
            />
          </div>
        )}
      </div>
    );
  }

  /* ── Full (hero) ──────────────────────────────────────────────────── */
  return (
    <div ref={dropdownRef} className="relative w-full max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-2 bg-card/95 backdrop-blur-sm p-2 rounded-2xl shadow-2xl border border-white/20">
        {/* Query */}
        <div
          className="flex-1 flex items-center gap-3 px-4 py-3 bg-muted/60 rounded-xl cursor-text transition-all focus-within:bg-background focus-within:ring-2 focus-within:ring-dz-green/20"
          onClick={() => document.getElementById('hero-search')?.focus()}
        >
          <Search size={18} className={`shrink-0 transition-colors ${focused ? 'text-dz-green' : 'text-muted-foreground'}`} />
          <div className="flex-1 min-w-0">
            {focused && <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-0.5">{t.searchPlaceholder}</span>}
            <input
              id="hero-search"
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={t.aiSearchPlaceholder}
              className="w-full bg-transparent outline-none text-sm sm:text-base placeholder:text-muted-foreground font-medium"
              autoComplete="off"
            />
          </div>
          {query && (
            <button onClick={() => setQuery('')} className="p-1 hover:bg-muted rounded-full shrink-0">
              <X size={14} className="text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px bg-border my-1" />

        {/* Wilaya selector */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-3 bg-muted/60 rounded-xl cursor-pointer w-44 transition-all hover:bg-muted"
          onClick={() => document.getElementById('wilaya-select')?.focus()}>
          <MapPin size={16} className="text-muted-foreground shrink-0" />
          <select
            id="wilaya-select"
            value={wilaya}
            onChange={e => setWilaya(e.target.value)}
            onFocus={() => setFocused(true)}
            className="flex-1 bg-transparent outline-none text-sm font-medium text-foreground cursor-pointer"
          >
            <option value="">{t.allAlgeria}</option>
            {WILAYAS.map(w => (
              <option key={w.code} value={w.code}>
                {language === 'ar' ? w.nameAr : language === 'en' ? w.nameEn : w.nameFr}
              </option>
            ))}
          </select>
        </div>

        {/* Search button */}
        <button
          onClick={() => handleSearch()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-dz-green hover:bg-dz-green2 text-white font-bold rounded-xl transition-all active:scale-95 shadow-brand-md whitespace-nowrap"
        >
          <Search size={18} />
          <span className="hidden sm:inline">{t.searchBtn}</span>
        </button>
      </div>

      {/* Dropdown */}
      {focused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-up">
          <SearchDropdown
            results={displayResults}
            aiLoading={aiLoading}
            showTrending={showTrending}
            onSelect={handleSelect}
            t={t}
          />
        </div>
      )}
    </div>
  );
};

/* ── Dropdown subcomponent ──────────────────────────────────────────── */
interface DropdownProps {
  results:     SearchSuggestion[];
  aiLoading:   boolean;
  showTrending:boolean;
  onSelect:    (text: string) => void;
  t:           any;
}

const SearchDropdown: React.FC<DropdownProps> = ({ results, aiLoading, showTrending, onSelect, t }) => (
  <div className="p-3">
    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2 px-1">
      {showTrending ? (
        <><TrendingUp size={11} />{t.trending}</>
      ) : aiLoading ? (
        <><Loader2 size={10} className="animate-spin text-dz-green" />{t.aiLoading}</>
      ) : (
        <><Bot size={11} className="text-dz-green" />Suggestions IA</>
      )}
    </div>

    {aiLoading && !showTrending ? (
      <div className="space-y-2">
        {[1,2,3].map(i => <div key={i} className="h-11 rounded-xl bg-muted animate-pulse" />)}
      </div>
    ) : showTrending ? (
      <div className="flex flex-wrap gap-1.5">
        {results.map((s, i) => (
          <button key={i} onClick={() => onSelect(s.text)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-dz-green/10 hover:text-dz-green rounded-full text-xs font-medium transition-colors border border-border hover:border-dz-green/30">
            {s.icon && <span className="text-sm">{s.icon}</span>}
            {s.text}
          </button>
        ))}
      </div>
    ) : (
      results.map((s, i) => (
        <button key={i} onClick={() => onSelect(s.text)}
          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-xl transition-colors group text-left">
          <div className="w-8 h-8 rounded-full bg-muted group-hover:bg-dz-green group-hover:text-white flex items-center justify-center transition-colors shrink-0">
            {s.icon ? <span className="text-base">{s.icon}</span> : <Search size={14} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{s.text}</p>
            <p className="text-xs text-muted-foreground truncate">{s.category}</p>
          </div>
          <ChevronRight size={13} className="text-muted-foreground group-hover:text-dz-green shrink-0" />
        </button>
      ))
    )}
  </div>
);

export default SmartSearchBar;
