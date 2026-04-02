import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, TrendingUp, Shield, Zap, Star,
  ArrowRight, ChevronRight, Sparkles, Users, Package, Eye,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp }      from '../contexts/AppContext';
import { CATEGORIES }  from '../data/categories';
import AlgeriaMap      from '../components/map/AlgeriaMap';
import ListingCard     from '../components/listing/ListingCard';
import { WILAYAS }     from '../data/wilayas';

const HomePage: React.FC = () => {
  const { t, language }   = useLanguage();
  const { listings }      = useApp();
  const navigate          = useNavigate();
  const [query, setQuery] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [heroWilaya, setHeroWilaya] = useState<string | null>(null);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query)  params.set('q', query);
    if (wilaya) params.set('wilaya', wilaya);
    navigate(`/search?${params}`);
  };

  // Live stats
  const stats = useMemo(() => ({
    total:    listings.length,
    active:   listings.filter(l => l.status === 'active').length,
    wilayas:  new Set(listings.map(l => l.wilayaId)).size,
    today:    listings.filter(l => Date.now() - l.timestamp < 86400000).length,
  }), [listings]);

  // Featured = premium + urgent first, then recent
  const featured = useMemo(() =>
    [...listings]
      .sort((a, b) => {
        const scoreA = (a.isPremium ? 3 : 0) + (a.isUrgent ? 2 : 0) + (b.ranking?.boostLevel || 0);
        const scoreB = (b.isPremium ? 3 : 0) + (b.isUrgent ? 2 : 0) + (a.ranking?.boostLevel || 0);
        return scoreB - scoreA || b.timestamp - a.timestamp;
      })
      .slice(0, 8)
  , [listings]);

  // Recent
  const recent = useMemo(() =>
    [...listings].sort((a, b) => b.timestamp - a.timestamp).slice(0, 8)
  , [listings]);

  // Listing counts per wilaya for map density
  const listingCounts = useMemo(() => {
    const counts: Record<string,number> = {};
    listings.forEach(l => { if(l.wilayaId) counts[l.wilayaId] = (counts[l.wilayaId]||0)+1; });
    return counts;
  }, [listings]);

  const catName = (c: typeof CATEGORIES[0]) =>
    language === 'ar' ? c.nameAr : language === 'en' ? c.nameEn : c.nameFr;

  return (
    <div className="min-h-screen bg-background">

      {/* ══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="hero-bg relative overflow-hidden min-h-[520px] flex items-center">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage:'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px),radial-gradient(circle at 80% 50%, #fff 1px, transparent 1px)', backgroundSize:'40px 40px'}}/>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* Left — text + search */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 backdrop-blur-sm">
                <Sparkles size={13} className="text-amber-400"/>
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
                  N°1 des petites annonces en Algérie
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                Achetez. Vendez.<br/>
                <span style={{color:'#D4AF37'}}>Trouvez.</span>
              </h1>

              <p className="text-white/60 text-base leading-relaxed max-w-md">
                {stats.total.toLocaleString()} annonces dans toutes les wilayas.
                Gratuit, rapide, sécurisé.
              </p>

              {/* Search bar */}
              <div className="bg-card rounded-2xl shadow-2xl p-2 border border-white/10">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                    <input
                      value={query} onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      placeholder={language === 'ar' ? 'ابحث عن شيء ما…' : 'Que cherchez-vous ?'}
                      className="w-full pl-11 pr-4 py-3.5 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none"
                    />
                  </div>
                  <div className="relative sm:w-40">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
                    <select
                      value={wilaya} onChange={e => setWilaya(e.target.value)}
                      className="w-full pl-9 pr-3 py-3.5 bg-muted border border-border rounded-xl text-sm font-medium outline-none cursor-pointer appearance-none"
                    >
                      <option value="">Toute l'Algérie</option>
                      {WILAYAS.map(w => (
                        <option key={w.code} value={w.code}>
                          {language === 'ar' ? w.nameAr : w.nameFr}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button onClick={handleSearch}
                    className="px-6 py-3.5 bg-dz-green hover:bg-dz-green2 text-white font-black rounded-xl shadow-brand-md transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2">
                    <Search size={16}/> Rechercher
                  </button>
                </div>
              </div>

              {/* Quick links */}
              <div className="flex flex-wrap gap-2">
                {['Voitures','Appartements','iPhone','Emploi','Villas'].map(q => (
                  <button key={q}
                    onClick={() => navigate(`/search?q=${q}`)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 text-xs font-semibold rounded-full transition-all">
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Right — stats cards */}
            <div className="hidden lg:grid grid-cols-2 gap-3">
              {[
                { icon:'📋', label:'Annonces actives', value:stats.active.toLocaleString(), color:'from-dz-green/20 to-dz-green/5' },
                { icon:'🗺️', label:'Wilayas couvertes', value:`${stats.wilayas}/58`, color:'from-blue-500/20 to-blue-500/5' },
                { icon:'⚡', label:'Aujourd\'hui', value:`+${stats.today}`, color:'from-amber-500/20 to-amber-500/5' },
                { icon:'🛡️', label:'Vendeurs vérifiés', value:'100%', color:'from-purple-500/20 to-purple-500/5' },
              ].map(s => (
                <div key={s.label} className={`bg-gradient-to-br ${s.color} backdrop-blur-sm border border-white/10 rounded-2xl p-4`}>
                  <span className="text-2xl block mb-2">{s.icon}</span>
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className="text-xs text-white/60 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CATEGORIES ══════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-foreground">Toutes les catégories</h2>
          <Link to="/search" className="text-sm font-bold text-dz-green hover:underline flex items-center gap-1">
            Voir tout <ArrowRight size={14}/>
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2.5">
          {CATEGORIES.map(cat => {
            const count = listings.filter(l => l.categoryId === cat.id).length;
            return (
              <Link key={cat.id} to={`/search?category=${cat.id}`}
                className="group flex flex-col items-center gap-2 p-3 rounded-2xl border border-border bg-card hover:border-dz-green hover:shadow-card-hover transition-all hover:-translate-y-0.5 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                  style={{ background: cat.color + '18' }}>
                  {cat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-foreground leading-tight">{catName(cat)}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{count.toLocaleString()}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ══ MAP + FEATURED ══════════════════════════════════════════════════ */}
      <section className="bg-muted/30 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* Map */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
              <div className="hero-bg p-5">
                <h2 className="text-lg font-black text-white mb-0.5">Rechercher par wilaya</h2>
                <p className="text-white/50 text-xs">Cliquez sur une wilaya pour filtrer</p>
              </div>
              <div className="p-5">
                <AlgeriaMap
                  className="w-full"
                  listingCounts={listingCounts}
                  selectedWilaya={heroWilaya}
                  onSelectWilaya={(code, name) => {
                    setHeroWilaya(prev => prev === code ? null : code);
                    navigate(`/search?wilaya=${code}`);
                  }}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                  <span className="font-bold text-foreground">{heroWilaya ? listings.filter(l=>l.wilayaId===heroWilaya).length.toLocaleString() : '0'} annonces sélectionnées</span>
                  <span>{stats.active.toLocaleString()} annonces au total</span>
                </div>
              </div>
            </div>

            {/* Trending */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                  <TrendingUp size={18} className="text-dz-green"/> En vedette
                </h2>
                <Link to="/search?sort=relevance" className="text-sm font-bold text-dz-green hover:underline">
                  Voir tout
                </Link>
              </div>
              <div className="space-y-3">
                {featured.slice(0, 4).map(l => (
                  <Link key={l.id} to={`/listing/${l.id}`}
                    className="flex items-center gap-3 p-3 bg-card border border-border hover:border-dz-green rounded-2xl transition-all hover:shadow-card group">
                    <img src={l.imageUrl} alt={l.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {l.isPremium && <span className="text-[9px] bg-amber-500 text-white font-black px-1.5 py-0.5 rounded-full">PREMIUM</span>}
                        {l.isUrgent  && <span className="text-[9px] bg-dz-red text-white font-black px-1.5 py-0.5 rounded-full">URGENT</span>}
                      </div>
                      <p className="font-bold text-sm text-foreground truncate">{l.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-base font-black text-dz-green">
                          {l.price === 0 ? 'Gratuit' : `${l.price.toLocaleString()} DA`}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin size={10}/>{l.wilayaName}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:text-dz-green shrink-0"/>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ RECENT LISTINGS ═════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Zap size={20} className="text-amber-500"/> Dernières annonces
          </h2>
          <Link to="/search?sort=date" className="text-sm font-bold text-dz-green hover:underline flex items-center gap-1">
            Voir tout <ArrowRight size={14}/>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recent.map(l => <ListingCard key={l.id} listing={l}/>)}
        </div>
        <div className="text-center mt-8">
          <Link to="/search"
            className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background font-black rounded-2xl shadow-sm hover:bg-foreground/80 transition-all hover:-translate-y-0.5">
            Voir toutes les annonces
            <ArrowRight size={18}/>
          </Link>
        </div>
      </section>

      {/* ══ WHY FENNEC ══════════════════════════════════════════════════════ */}
      <section className="bg-muted/30 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-foreground text-center mb-10">
            Pourquoi choisir <span className="text-dz-green">Le Fennec</span> ?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Shield,  color: 'text-dz-green',  bg: 'bg-dz-green/10',  title: '100% sécurisé',     desc: 'Modération IA, vendeurs vérifiés, signalement en 1 clic.' },
              { icon: Zap,     color: 'text-amber-500', bg: 'bg-amber-500/10', title: 'Rapide & gratuit',   desc: 'Publiez en 2 minutes. Aucun frais pour les annonces de base.' },
              { icon: Users,   color: 'text-blue-500',  bg: 'bg-blue-500/10',  title: '58 wilayas',         desc: `${stats.total.toLocaleString()} annonces dans toute l'Algérie, 24h/24.` },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center gap-4 p-6 bg-card border border-border rounded-3xl hover:shadow-card transition-all">
                <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center`}>
                  <Icon size={26} className={color}/>
                </div>
                <div>
                  <h3 className="font-black text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═════════════════════════════════════════════════════════════ */}
      <section className="hero-bg py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-white mb-3">
            Prêt à vendre ?
          </h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Déposez votre annonce gratuitement. Des milliers d'acheteurs vous attendent.
          </p>
          <Link to="/post"
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-dz-green font-black text-lg rounded-2xl shadow-2xl hover:bg-white/90 transition-all hover:-translate-y-1 active:scale-95">
            <Package size={22}/> Déposer une annonce gratuite
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
