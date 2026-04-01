import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bot, Sparkles, CheckCircle2, Search, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import AlgeriaMap from '../components/map/AlgeriaMap';
import ListingCard from '../components/listing/ListingCard';
import { CATEGORIES } from '../data/categories';
import { WILAYAS } from '../data/wilayas';

const HomePage: React.FC = () => {
  const { t, language }  = useLanguage();
  const { listings }      = useApp();
  const navigate          = useNavigate();
  const [q, setQ]         = useState('');
  const [wilaya, setWilaya] = useState('');
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const active = listings.filter(l => l.status === 'active');

  // Compute listing counts per wilaya for density map
  const listingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    active.forEach(l => {
      if (l.wilayaId) counts[l.wilayaId] = (counts[l.wilayaId] || 0) + 1;
    });
    return counts;
  }, [active]);

  const trending = [...active].sort((a, b) =>
    (b.ranking.boostLevel * 50 + b.ranking.trustScore) - (a.ranking.boostLevel * 50 + a.ranking.trustScore)
  ).slice(0, 4);

  const recent = [...active].sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);

  const catName = (cat: typeof CATEGORIES[0]) =>
    language === 'ar' ? cat.nameAr : language === 'en' ? cat.nameEn : cat.nameFr;

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q);
    if (wilaya) params.set('wilaya', wilaya);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="hero-bg relative overflow-hidden rounded-b-[2.5rem] pb-24 mb-0" aria-label="Accueil">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.04]" aria-hidden="true">
          <svg width="100%" height="100%">
            <defs><pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="14" cy="14" r="1" fill="white"/>
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#dots)"/>
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.06]" aria-hidden="true"
          style={{ background: 'radial-gradient(ellipse at 80% 30%, #fff, transparent)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-6">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">

            {/* Left */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 border"
                style={{ background:'rgba(255,255,255,.08)', borderColor:'rgba(255,255,255,.15)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"/>
                <span className="text-xs font-bold text-white/70 uppercase tracking-wider">
                  {language === 'ar' ? 'رقم 1 في الجزائر' : language === 'en' ? 'N°1 IN ALGERIA' : 'N°1 DES ANNONCES EN ALGÉRIE'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4"
                style={{ letterSpacing: '-0.03em' }}>
                {language === 'ar'
                  ? <><span style={{color:'#D4AF37'}}>اشتري. بع.</span> مجانًا.</>
                  : language === 'en'
                  ? <>Buy. Sell. <span style={{color:'#D4AF37'}}>For free.</span></>
                  : <>Achetez. Vendez. <span style={{color:'#D4AF37'}}>Gratuitement.</span></>
                }
              </h1>

              <p className="text-sm sm:text-base text-white/60 leading-relaxed mb-6 max-w-md mx-auto lg:mx-0">
                {language === 'ar'
                  ? 'منصة مرجعية للإعلانات المبوبة في الجزائر — مجانية، سريعة، بذكاء اصطناعي.'
                  : language === 'en'
                  ? 'The reference classifieds platform in Algeria — free, fast, AI-powered.'
                  : 'La plateforme de référence pour les petites annonces en Algérie — gratuite, rapide, IA intégrée.'}
              </p>

              {/* Search */}
              <form onSubmit={handleSearch} className="mb-5" aria-label="Rechercher une annonce">
                <div className="flex flex-col sm:flex-row gap-2 bg-card/95 backdrop-blur-sm p-2 rounded-2xl shadow-2xl border border-white/20">
                  <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-muted/60 rounded-xl focus-within:bg-background focus-within:ring-1 focus-within:ring-dz-green/20 transition-all cursor-text">
                    <Search size={16} className="text-muted-foreground shrink-0" aria-hidden="true"/>
                    <input
                      type="text" value={q} onChange={e => setQ(e.target.value)}
                      placeholder={language === 'ar' ? 'ماذا تبحث عنه؟' : language === 'en' ? 'What are you looking for?' : 'Que cherchez-vous ?'}
                      className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground font-medium"
                      aria-label="Mot-clé de recherche"
                    />
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2.5 bg-muted/60 rounded-xl w-44 cursor-pointer">
                    <MapPin size={14} className="text-muted-foreground shrink-0" aria-hidden="true"/>
                    <select value={wilaya} onChange={e => setWilaya(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm font-medium text-foreground cursor-pointer truncate"
                      aria-label="Sélectionner une wilaya">
                      <option value="">{t.allAlgeria}</option>
                      {WILAYAS.map(w => (
                        <option key={w.code} value={w.code}>
                          {language === 'ar' ? w.nameAr : language === 'en' ? w.nameEn : w.nameFr}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit"
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-dz-green hover:bg-dz-green2 text-white font-bold rounded-xl transition-all active:scale-95 shadow-brand-md">
                    <Search size={16} aria-hidden="true"/>
                    <span className="hidden sm:inline">{t.searchBtn}</span>
                  </button>
                </div>
              </form>

              {/* Trending tags */}
              <div className="flex flex-wrap items-center gap-2 justify-center lg:justify-start mb-5">
                <span className="text-xs text-white/40">{t.trending} :</span>
                {['Golf 8', 'Appartement F3 Alger', 'iPhone 15 Pro', 'Toyota Hilux'].map(tag => (
                  <button key={tag} onClick={() => navigate(`/search?q=${tag}`)}
                    className="text-xs text-white/70 border rounded-full px-3 py-1 transition-all hover:bg-white/10 hover:text-white"
                    style={{ borderColor: 'rgba(255,255,255,.18)' }}>
                    {tag}
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div className="flex gap-5 justify-center lg:justify-start pt-5 border-t"
                style={{ borderColor: 'rgba(255,255,255,.1)' }} aria-label="Statistiques">
                {[
                  { value: `${active.length.toLocaleString()}`, label: t.activeListings, color: 'text-emerald-400' },
                  { value: '58',   label: t.wilayasCovered, color: 'text-white' },
                  { value: '100%', label: t.totalFree,      color: 'text-emerald-400' },
                ].map((s, i) => (
                  <React.Fragment key={s.label}>
                    {i > 0 && <div className="w-px" style={{ background: 'rgba(255,255,255,.1)' }} aria-hidden="true"/>}
                    <div>
                      <div className={`text-xl sm:text-2xl font-black ${s.color} leading-none`}>{s.value}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{s.label}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Right — Algeria Map */}
            <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 hidden md:block">
              <div className="rounded-2xl p-4 border"
                style={{ background: 'rgba(255,255,255,.06)', borderColor: 'rgba(255,255,255,.12)' }}>
                <p className="text-[10px] font-bold text-white/50 text-center mb-3 uppercase tracking-widest">
                  {t.searchByRegion}
                </p>
                <AlgeriaMap
                  compact
                  selectedWilaya={activeRegion}
                  listingCounts={listingCounts}
                  onSelectWilaya={(code, name) => {
                    setActiveRegion(code);
                    navigate(`/search?wilaya=${code}`);
                  }}
                  className="w-full aspect-[5/6]"
                />
                <p className="text-[9px] text-white/30 text-center mt-2">{t.clickWilaya}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10" aria-label="Catégories">
        <div className="bg-card rounded-3xl border border-border shadow-card p-5 sm:p-6">
          <nav aria-label="Navigation par catégorie">
            <ul className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-1 sm:gap-2 list-none p-0 m-0">
              {CATEGORIES.map(cat => (
                <li key={cat.id}>
                  <Link to={`/search?category=${cat.id}`}
                    className="group flex flex-col items-center gap-2 p-2 sm:p-3 rounded-xl hover:-translate-y-0.5 transition-all"
                    aria-label={catName(cat)}>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform"
                      style={{ background: cat.color + '18' }} aria-hidden="true">
                      {cat.icon}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground group-hover:text-dz-green transition-colors text-center leading-tight">
                      {catName(cat)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* ── SPONSORED BANNER ─────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5" aria-label="Annonces sponsorisées">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 bg-amber-200 dark:bg-amber-800/50 px-2 py-0.5 rounded-full shrink-0">
            {t.sponsoredAds}
          </span>
          <div className="flex gap-4 overflow-hidden text-xs text-amber-700 dark:text-amber-400 font-medium">
            <span className="cursor-pointer hover:underline whitespace-nowrap">🚗 Golf 8 GTI — 8 500 000 DA — Alger</span>
            <span className="cursor-pointer hover:underline whitespace-nowrap hidden sm:inline">🏠 Villa Duplex — 65 000 000 DA — Oran</span>
            <span className="cursor-pointer hover:underline whitespace-nowrap hidden md:inline">📱 iPhone 15 Pro — 175 000 DA — Blida</span>
          </div>
        </div>
      </div>

      {/* ── À LA UNE ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10" aria-label="Annonces à la une">
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="text-xs font-bold text-dz-green uppercase tracking-widest block mb-1">Explorer</span>
            <h2 className="text-2xl font-black text-foreground">
              {language === 'ar' ? 'الأكثر مشاهدة 🔥' : language === 'en' ? 'Featured 🔥' : 'À la une 🔥'}
            </h2>
          </div>
          <Link to="/search" className="flex items-center gap-1.5 text-sm font-semibold text-dz-green hover:underline">
            {t.viewAll} <ArrowRight size={14} aria-hidden="true"/>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trending.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      </section>

      {/* ── AI PRO BANNER ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10" aria-label="Fonctionnalités IA">
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-6 p-8 relative">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-[0.05]"
              style={{ background: 'var(--dz-green)', filter: 'blur(60px)' }} aria-hidden="true"/>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--dz-green)', boxShadow: '0 8px 24px rgba(0,98,51,.3)' }}>
              <Bot size={28} className="text-white" aria-hidden="true"/>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-dz-green uppercase tracking-wider mb-2">
                <Sparkles size={10} aria-hidden="true"/> {t.aiPowered}
              </div>
              <h3 className="text-xl font-black text-foreground mb-1">
                {language === 'ar' ? 'أضف إعلانًا احترافيًا في 60 ثانية'
                  : language === 'en' ? 'Post a perfect ad in 60 seconds'
                  : 'Déposez une annonce parfaite en 60 secondes'}
              </h3>
              <p className="text-sm text-muted-foreground">{t.aiDescription}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link to="/post"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-dz-green hover:bg-dz-green2 text-white font-bold rounded-xl transition-all shadow-brand-md whitespace-nowrap">
                {t.postFree}
              </Link>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                {['Titre IA', 'Description IA', 'Modération IA', 'Prix estimé IA'].map(f => (
                  <span key={f} className="flex items-center gap-1">
                    <CheckCircle2 size={10} className="text-dz-green" aria-hidden="true"/> {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RÉCENTES ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-20 md:mb-10" aria-label="Annonces récentes">
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="text-xs font-bold text-dz-green uppercase tracking-widest block mb-1">{t.recent}</span>
            <h2 className="text-2xl font-black text-foreground">
              {language === 'ar' ? 'أحدث الإعلانات 🆕' : language === 'en' ? 'Recent listings 🆕' : 'Annonces récentes 🆕'}
            </h2>
          </div>
          <Link to="/search?sort=date" className="flex items-center gap-1.5 text-sm font-semibold text-dz-green hover:underline">
            {t.viewAll} <ArrowRight size={14} aria-hidden="true"/>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recent.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
