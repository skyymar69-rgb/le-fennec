import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, User, Plus, Menu, X, ChevronDown, LayoutGrid, Search } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import ThemeSwitcher from '../ui/ThemeSwitcher';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { CATEGORIES } from '../../data/categories';
import { WILAYAS } from '../../data/wilayas';
import logoUrl from '../../assets/logo.png';

const Header: React.FC = () => {
  const { t, language }  = useLanguage();
  const { user, favorites, threads } = useApp();
  const location         = useLocation();
  const navigate         = useNavigate();
  const [megaOpen,   setMegaOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q,          setQ]          = useState('');
  const [wilaya,     setWilaya]     = useState('');
  const megaRef = useRef<HTMLDivElement>(null);
  const unread  = threads.reduce((s, th) => s + th.unread, 0);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { setMobileOpen(false); setMegaOpen(false); }, [location]);

  const catName = (cat: (typeof CATEGORIES)[0]) =>
    language === 'ar' ? cat.nameAr : language === 'en' ? cat.nameEn : cat.nameFr;

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q);
    if (wilaya) params.set('wilaya', wilaya);
    navigate(`/search?${params.toString()}`);
  };

  if (location.pathname === '/auth') return null;

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">

        {/* ── Top row ── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 gap-3">

            {/* Logo */}
            <Link to="/" className="shrink-0 group" aria-label="Le Fennec DZ Market">
              <img src={logoUrl} alt="Le Fennec DZ Market" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" />
            </Link>

            {/* ── Search bar (desktop) ── */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl items-stretch gap-0 bg-muted border border-border rounded-xl overflow-hidden focus-within:border-dz-green focus-within:ring-1 focus-within:ring-dz-green/20 transition-all">
              {/* Query input */}
              <div className="flex items-center gap-2 flex-1 px-3">
                <Search size={15} className="text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder={t.aiSearchPlaceholder}
                  className="flex-1 bg-transparent outline-none text-sm py-2.5 min-w-0 placeholder:text-muted-foreground"
                  autoComplete="off"
                />
              </div>
              {/* Separator */}
              <div className="w-px bg-border self-stretch my-2" />
              {/* Wilaya selector */}
              <div className="flex items-center px-3 bg-muted/50 min-w-[130px] max-w-[160px]">
                <select
                  value={wilaya}
                  onChange={e => setWilaya(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-muted-foreground cursor-pointer truncate"
                  aria-label="Sélectionner une wilaya"
                >
                  <option value="">{t.allAlgeria}</option>
                  {WILAYAS.map(w => (
                    <option key={w.code} value={w.code}>
                      {language === 'ar' ? w.nameAr : language === 'en' ? w.nameEn : w.nameFr}
                    </option>
                  ))}
                </select>
              </div>
              {/* Search button - SEPARATE, no overlap */}
              <button
                type="submit"
                className="flex items-center gap-2 px-5 bg-dz-green hover:bg-dz-green2 text-white font-bold text-sm transition-colors shrink-0"
                aria-label="Rechercher"
              >
                <Search size={16} />
                <span className="hidden lg:inline">{t.searchBtn}</span>
              </button>
            </form>

            {/* ── Right nav ── */}
            <nav className="flex items-center gap-1 ml-auto" aria-label="Navigation principale">
              <ThemeSwitcher size="sm" />
              <LanguageSwitcher size="sm" />

              {/* Mobile search */}
              <button onClick={() => navigate('/search')}
                className="md:hidden p-2 rounded-full hover:bg-muted text-muted-foreground"
                aria-label="Rechercher">
                <Search size={19} />
              </button>

              {/* Favorites */}
              <Link to="/favorites" className="relative p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title={t.favorites}>
                <Heart size={19} />
                {favorites.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-dz-red text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-0.5">
                    {favorites.length > 99 ? '99+' : favorites.length}
                  </span>
                )}
              </Link>

              {/* Messages */}
              <Link to="/messages" className="relative p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground hidden sm:flex transition-colors" title={t.messages}>
                <MessageSquare size={19} />
                {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-dz-red rounded-full ring-2 ring-background" />}
              </Link>

              {/* Auth */}
              {user ? (
                <Link to="/dashboard" className="flex items-center gap-2 border border-border rounded-full px-2.5 py-1.5 hover:shadow-md transition-all">
                  <div className="w-6 h-6 rounded-full bg-dz-green/20 flex items-center justify-center text-xs font-black text-dz-green">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-foreground hidden sm:inline max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                </Link>
              ) : (
                <Link to="/auth" className="flex items-center gap-1.5 border border-border rounded-full px-3 py-1.5 hover:shadow-md text-foreground transition-all">
                  <User size={15} />
                  <span className="text-sm font-medium hidden sm:inline">{t.login}</span>
                </Link>
              )}

              {/* Post CTA */}
              <Link to="/post" className="flex items-center gap-1.5 bg-dz-green hover:bg-dz-green2 text-white px-3 sm:px-4 py-2 rounded-xl font-bold text-sm shadow-brand-sm hover:shadow-brand-md hover:-translate-y-0.5 transition-all">
                <Plus size={15} strokeWidth={3} />
                <span className="hidden sm:inline">{t.post}</span>
              </Link>

              {/* Mobile menu */}
              <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-full hover:bg-muted text-foreground" aria-label="Menu">
                <Menu size={20} />
              </button>
            </nav>
          </div>
        </div>

        {/* ── Category bar ── */}
        <div className="hidden md:block border-t border-border/50 bg-background/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-9 gap-1 overflow-x-auto no-scrollbar">
              {/* All categories */}
              <div ref={megaRef} className="relative shrink-0">
                <button
                  onClick={() => setMegaOpen(!megaOpen)}
                  onMouseEnter={() => setMegaOpen(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${megaOpen ? 'bg-dz-green text-white' : 'text-foreground hover:bg-muted'}`}
                >
                  <LayoutGrid size={13} />
                  {language === 'ar' ? 'الفئات' : language === 'en' ? 'Categories' : 'Catégories'}
                  <ChevronDown size={11} className={`transition-transform ${megaOpen ? 'rotate-180' : ''}`} />
                </button>
                {megaOpen && (
                  <div onMouseLeave={() => setMegaOpen(false)}
                    className="absolute top-full left-0 mt-1 w-[580px] bg-card border border-border rounded-2xl shadow-2xl p-4 z-50 grid grid-cols-3 gap-1">
                    {CATEGORIES.map(cat => (
                      <Link key={cat.id} to={`/search?category=${cat.id}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted transition-colors group"
                        onClick={() => setMegaOpen(false)}>
                        <span className="text-base">{cat.icon}</span>
                        <span className="text-sm font-semibold text-foreground group-hover:text-dz-green transition-colors truncate">{catName(cat)}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {/* Quick cat links */}
              {CATEGORIES.slice(0, 8).map(cat => (
                <Link key={cat.id} to={`/search?category=${cat.id}`}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-dz-green hover:bg-dz-green/5 rounded-lg transition-all whitespace-nowrap shrink-0">
                  <span className="text-sm">{cat.icon}</span>
                  {catName(cat)}
                </Link>
              ))}
              <span className="ml-auto text-[10px] font-bold text-dz-red bg-dz-red/10 px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
                ✦ {language === 'ar' ? 'عروض خاصة' : language === 'en' ? 'Deals' : 'Bons plans'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] flex" role="dialog" aria-modal="true">
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="w-72 bg-card h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <img src={logoUrl} alt="Le Fennec DZ Market" className="h-9 w-auto object-contain" />
              <button onClick={() => setMobileOpen(false)} className="p-1.5 hover:bg-muted rounded-lg" aria-label="Fermer">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="p-3 border-b border-border">
              <div className="flex gap-2">
                <input type="text" value={q} onChange={e => setQ(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm outline-none" />
                <button type="submit" className="bg-dz-green text-white px-3 py-2 rounded-xl">
                  <Search size={16} />
                </button>
              </div>
            </form>
            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {[
                { to:'/',          label: t.home },
                { to:'/search',    label: t.search },
                { to:'/favorites', label: t.favorites },
                { to:'/messages',  label: t.messages },
                { to:'/dashboard', label: t.dashboard },
              ].map(item => (
                <Link key={item.to} to={item.to}
                  className="flex items-center px-3 py-2.5 rounded-xl hover:bg-muted font-medium text-foreground text-sm transition-colors">
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-2">{t.category}</p>
                {CATEGORIES.map(cat => (
                  <Link key={cat.id} to={`/search?category=${cat.id}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <span className="text-base">{cat.icon}</span>
                    {catName(cat)}
                  </Link>
                ))}
              </div>
            </nav>
            <div className="p-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <ThemeSwitcher showLabel />
                <LanguageSwitcher />
              </div>
              <Link to="/post" className="flex items-center justify-center gap-2 w-full py-3 bg-dz-green hover:bg-dz-green2 text-white font-bold rounded-xl transition-colors shadow-brand-sm">
                <Plus size={18} strokeWidth={3} /> {t.postAdBtn}
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Header;
