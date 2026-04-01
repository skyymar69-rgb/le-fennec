import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bot, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import SmartSearchBar from '../components/ui/SmartSearchBar';
import AlgeriaMap from '../components/map/AlgeriaMap';
import ListingCard from '../components/listing/ListingCard';
import { CATEGORIES } from '../data/categories';

const GOLD = '#D4AF37';

const HomePage: React.FC = () => {
  const { t, language }      = useLanguage();
  const { listings }          = useApp();
  const navigate              = useNavigate();
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const active  = listings.filter(l => l.status === 'active');
  const featured = active.filter(l => l.isPremium || l.ranking.boostLevel > 0).slice(0, 4);
  const trending = active.sort((a, b) =>
    (b.ranking.boostLevel * 50 + b.ranking.trustScore) -
    (a.ranking.boostLevel * 50 + a.ranking.trustScore)
  ).slice(0, 8);
  const recent = [...active].sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);

  const catName = (cat: (typeof CATEGORIES)[0]) =>
    language === 'ar' ? cat.nameAr : language === 'en' ? cat.nameEn : cat.nameFr;

  const stats = [
    { value: '142k', label: t.activeListings, color: 'text-dz-green' },
    { value: '58',   label: t.wilayasCovered, color: 'text-foreground' },
    { value: '100%', label: t.totalFree,      color: 'text-dz-green'  },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="hero-bg relative overflow-hidden rounded-b-[2.5rem] pb-20 mb-0">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.04]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="16" cy="16" r="1.2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        {/* Glow orbs */}
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[60%] rounded-full opacity-[0.07]"
          style={{ background: '#fff', filter: 'blur(80px)' }} />
        <div className="absolute bottom-[-10%] right-[0%] w-[35%] h-[50%] rounded-full opacity-[0.06]"
          style={{ background: GOLD, filter: 'blur(70px)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-6">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* Left: Text + Search */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 border"
                style={{ background: 'rgba(255,255,255,.08)', borderColor: 'rgba(255,255,255,.15)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-dz-green animate-pulse" />
                <span className="text-xs font-bold text-white/70 uppercase tracking-wider">
                  {language === 'ar' ? 'رقم 1 في الجزائر' : language === 'en' ? '#1 IN ALGERIA' : 'N°1 DES ANNONCES EN ALGÉRIE'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-5"
                style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}>
                {language === 'ar' ? (
                  <>اشتري. بع. <span style={{ color: GOLD }}>مجانًا.</span></>
                ) : language === 'en' ? (
                  <>Buy. Sell. <span style={{ color: GOLD }}>For free.</span></>
                ) : (
                  <>Achetez. Vendez. <span style={{ color: GOLD }}>Gratuitement.</span></>
                )}
              </h1>

              <p className="text-sm sm:text-base text-white/60 leading-relaxed mb-7 max-w-md mx-auto lg:mx-0">
                {language === 'ar'
                  ? 'منصة الإعلانات المبوبة المرجعية في الجزائر — بسيطة، سريعة، مجانية.'
                  : language === 'en'
                  ? 'The reference classifieds platform in Algeria — simple, fast, free.'
                  : 'La plateforme de référence pour les petites annonces en Algérie — simple, rapide, gratuite.'}
              </p>

              {/* Big search */}
              <div className="mb-6">
                <SmartSearchBar onSearch={(q, w) => navigate(`/search?q=${q}${w ? `&wilaya=${w}` : ''}`)} />
              </div>

              {/* Quick tags */}
              <div className="flex flex-wrap items-center gap-2 justify-center lg:justify-start mb-6">
                <span className="text-xs text-white/40">{t.trending} :</span>
                {['Golf 8', 'Appartement F3', 'iPhone 15', 'Toyota Hilux'].map(tag => (
                  <button key={tag}
                    onClick={() => navigate(`/search?q=${tag}`)}
                    className="text-xs text-white/70 border rounded-full px-3 py-1 transition-all hover:bg-white/10"
                    style={{ borderColor: 'rgba(255,255,255,.15)' }}>
                    {tag}
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div className="flex gap-5 justify-center lg:justify-start pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,.1)' }}>
                {stats.map((s, i) => (
                  <React.Fragment key={s.label}>
                    {i > 0 && <div className="w-px" style={{ background: 'rgba(255,255,255,.1)' }} />}
                    <div>
                      <div className={`text-xl sm:text-2xl font-black ${s.color} leading-none`}>{s.value}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{s.label}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Right: Algeria Map */}
            <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 hidden md:block">
              <div className="rounded-2xl p-4 border" style={{ background: 'rgba(255,255,255,.07)', borderColor: 'rgba(255,255,255,.12)' }}>
                <p className="text-[10px] font-bold text-white/50 text-center mb-3 uppercase tracking-widest">
                  {t.searchByRegion}
                </p>
                <AlgeriaMap
                  compact
                  selectedWilaya={activeRegion}
                  onSelectWilaya={(code) => {
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

      {/* ── CATEGORIES GRID ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="bg-card rounded-3xl border border-border shadow-card p-5 sm:p-6">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-1 sm:gap-2">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.id}
                to={`/search?category=${cat.id}`}
                className="group flex flex-col items-center gap-2 p-2 sm:p-3 rounded-xl hover:-translate-y-0.5 transition-all"
              >
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform"
                  style={{ background: cat.color + '18' }}
                >
                  {cat.icon}
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground group-hover:text-dz-green transition-colors text-center leading-tight">
                  {catName(cat)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPONSORED BANNER ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
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
      </section>

      {/* ── À LA UNE ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="text-xs font-bold text-dz-green uppercase tracking-widest block mb-1">Explorer</span>
            <h2 className="text-2xl font-black text-foreground">
              {language === 'ar' ? 'الأكثر مشاهدة 🔥' : language === 'en' ? 'Featured 🔥' : 'À la une 🔥'}
            </h2>
          </div>
          <Link to="/search" className="flex items-center gap-1.5 text-sm font-semibold text-dz-green hover:underline">
            {t.viewAll} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trending.slice(0, 4).map(l => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      {/* ── AI PRO BANNER ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-6 p-8 relative">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-[0.05]"
              style={{ background: 'var(--dz-green)', filter: 'blur(60px)' }} />

            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--dz-green)', boxShadow: '0 8px 24px rgba(0,98,51,.3)' }}>
              <Bot size={28} className="text-white" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-dz-green uppercase tracking-wider mb-2">
                <Sparkles size={10} /> {t.aiPowered}
              </div>
              <h3 className="text-xl font-black text-foreground mb-1">
                {language === 'ar' ? 'أضف إعلانًا احترافيًا في 60 ثانية' : language === 'en' ? 'Post a perfect ad in 60 seconds' : 'Déposez une annonce parfaite en 60 secondes'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.aiDescription}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link to="/post"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-dz-green hover:bg-dz-green2 text-white font-bold rounded-xl transition-all shadow-brand-md whitespace-nowrap">
                {t.postFree}
              </Link>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                {['Titre IA', 'Description IA', 'Prix estimé IA'].map(f => (
                  <span key={f} className="flex items-center gap-1">
                    <CheckCircle2 size={10} className="text-dz-green" /> {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RÉCENTES ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-20 md:mb-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="text-xs font-bold text-dz-green uppercase tracking-widest block mb-1">{t.recent}</span>
            <h2 className="text-2xl font-black text-foreground">
              {language === 'ar' ? 'أحدث الإعلانات 🆕' : language === 'en' ? 'Recent listings 🆕' : 'Annonces récentes 🆕'}
            </h2>
          </div>
          <Link to="/search?sort=date" className="flex items-center gap-1.5 text-sm font-semibold text-dz-green hover:underline">
            {t.viewAll} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recent.slice(0, 8).map(l => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
