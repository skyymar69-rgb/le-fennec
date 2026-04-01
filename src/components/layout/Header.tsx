import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Heart, MessageSquare, Bell, User, Plus, Menu, X,
  ChevronDown, Search as SearchIcon, LayoutGrid,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import Logo from '../ui/Logo';
import ThemeSwitcher from '../ui/ThemeSwitcher';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import SmartSearchBar from '../ui/SmartSearchBar';
import { CATEGORIES } from '../../data/categories';

const Header: React.FC = () => {
  const { t, language }  = useLanguage();
  const { user, favorites, threads } = useApp();
  const location = useLocation();
  const [megaOpen,   setMegaOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);

  const unread = threads.reduce((s, th) => s + th.unread, 0);

  // Close mega on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setMegaOpen(false); }, [location]);

  const catName = (cat: (typeof CATEGORIES)[0]) =>
    language === 'ar' ? cat.nameAr : language === 'en' ? cat.nameEn : cat.nameFr;

  const isAuth = location.pathname === '/auth';
  if (isAuth) return null;

  return (
    <>
      {/* ── DESKTOP HEADER ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">

        {/* Top bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 gap-4">

            {/* Logo */}
            <Link to="/" className="shrink-0">
              <div className="flex items-center gap-2.5 group">
                <img
                  src="/assets/logo.png"
                  alt="Le Fennec"
                  className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
                />
                <Logo size="md" />
              </div>
            </Link>

            {/* Search bar (desktop) */}
            <div className="flex-1 max-w-lg hidden md:block">
              <SmartSearchBar isCompact />
            </div>

            {/* Right actions */}
            <nav className="flex items-center gap-1 ml-auto shrink-0">
              <ThemeSwitcher size="sm" />
              <LanguageSwitcher size="sm" />

              {/* Search toggle (mobile) */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
              >
                <SearchIcon size={19} />
              </button>

              {/* Favorites */}
              <Link
                to="/favorites"
                className="relative p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title={t.favorites}
              >
                <Heart size={19} />
                {favorites.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-dz-red text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {favorites.length > 9 ? '9+' : favorites.length}
                  </span>
                )}
              </Link>

              {/* Messages */}
              <Link
                to="/messages"
                className="relative p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground hidden sm:flex"
                title={t.messages}
              >
                <MessageSquare size={19} />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-dz-red rounded-full ring-2 ring-background" />
                )}
              </Link>

              {/* Notifications */}
              <button
                className="relative p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground hidden sm:flex"
                title={t.notifications ?? 'Notifications'}
              >
                <Bell size={19} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-dz-red rounded-full ring-2 ring-background" />
              </button>

              {/* User / Login */}
              {user ? (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 border border-border rounded-full px-2.5 py-1.5 hover:shadow-md transition-all ml-1"
                >
                  <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-sm font-medium text-foreground hidden sm:inline max-w-[80px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 border border-border rounded-full px-3 py-1.5 hover:shadow-md transition-all ml-1 text-foreground"
                >
                  <User size={16} />
                  <span className="text-sm font-medium hidden sm:inline">{t.login}</span>
                </Link>
              )}

              {/* Post Ad CTA */}
              <Link
                to="/post"
                className="flex items-center gap-1.5 bg-dz-green hover:bg-dz-green2 text-white px-4 py-2 rounded-full font-bold text-sm shadow-brand-sm hover:shadow-brand-md hover:-translate-y-0.5 transition-all ml-1"
              >
                <Plus size={16} strokeWidth={3} />
                <span className="hidden sm:inline">{t.post}</span>
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 rounded-full hover:bg-muted transition-colors text-foreground ml-1"
              >
                <Menu size={20} />
              </button>
            </nav>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-3 border-t border-border/50 pt-2 animate-fade-up">
            <SmartSearchBar isCompact />
          </div>
        )}

        {/* Category bar (desktop) */}
        <div className="hidden md:block border-t border-border/60 bg-background/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-10 gap-1">

              {/* All categories mega button */}
              <div ref={megaRef} className="relative">
                <button
                  onClick={() => setMegaOpen(!megaOpen)}
                  onMouseEnter={() => setMegaOpen(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    megaOpen
                      ? 'bg-dz-green text-white'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <LayoutGrid size={15} />
                  {t.category}
                  <ChevronDown size={13} className={`transition-transform ${megaOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Mega menu */}
                {megaOpen && (
                  <div
                    onMouseLeave={() => setMegaOpen(false)}
                    className="absolute top-full left-0 mt-1 w-[600px] bg-card border border-border rounded-2xl shadow-2xl p-4 z-50 animate-fade-up"
                  >
                    <div className="grid grid-cols-3 gap-1">
                      {CATEGORIES.map(cat => (
                        <Link
                          key={cat.id}
                          to={`/search?category=${cat.id}`}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted transition-colors group"
                          onClick={() => setMegaOpen(false)}
                        >
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
                            style={{ background: cat.color + '22' }}
                          >
                            {cat.icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground group-hover:text-dz-green transition-colors">
                              {catName(cat)}
                            </p>
                            {cat.count && (
                              <p className="text-[10px] text-muted-foreground">{cat.count.toLocaleString()} ann.</p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick links */}
              <div className="flex items-center gap-0.5 ml-2 overflow-x-auto no-scrollbar">
                {CATEGORIES.slice(0, 7).map(cat => (
                  <Link
                    key={cat.id}
                    to={`/search?category=${cat.id}`}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-dz-green hover:bg-dz-green/5 rounded-lg transition-all whitespace-nowrap"
                  >
                    <span>{cat.icon}</span>
                    <span>{catName(cat)}</span>
                  </Link>
                ))}
              </div>

              <span className="ml-auto text-xs font-bold text-dz-red bg-dz-red/10 px-2.5 py-1 rounded-full shrink-0">
                ✦ {language === 'ar' ? 'عروض خاصة' : language === 'en' ? 'Deals' : 'Bons plans'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER ──────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="w-72 bg-card h-full flex flex-col shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <img src="/assets/logo.png" alt="Le Fennec" className="w-8 h-8 object-contain" />
                <Logo size="sm" />
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 hover:bg-muted rounded-lg">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {[
                { to:'/',           label: t.home      },
                { to:'/search',     label: t.search    },
                { to:'/favorites',  label: t.favorites },
                { to:'/messages',   label: t.messages  },
                { to:'/dashboard',  label: t.dashboard },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center px-3 py-2.5 rounded-xl hover:bg-muted font-medium text-foreground text-sm"
                >
                  {item.label}
                </Link>
              ))}

              <div className="border-t border-border pt-3 mt-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-2">{t.category}</p>
                {CATEGORIES.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/search?category=${cat.id}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted text-sm text-muted-foreground hover:text-foreground"
                  >
                    <span className="text-base">{cat.icon}</span>
                    {catName(cat)}
                  </Link>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <ThemeSwitcher showLabel />
                <LanguageSwitcher />
              </div>
              <Link
                to="/post"
                className="flex items-center justify-center gap-2 w-full py-3 bg-dz-green hover:bg-dz-green2 text-white font-bold rounded-xl transition-colors shadow-brand-sm"
              >
                <Plus size={18} strokeWidth={3} />
                {t.postAdBtn}
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Header;
