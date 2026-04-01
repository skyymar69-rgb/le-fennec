// ═══════════════════════════════════════════════════════
// LISTING DETAIL PAGE
// ═══════════════════════════════════════════════════════
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Share2, Flag, MapPin, Clock, Eye, Phone, MessageSquare,
  Heart, ChevronLeft, ChevronRight, ShieldCheck, Star, Lock, X,
  CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import ListingCard from '../components/listing/ListingCard';


const ListingDetailPage: React.FC = () => {
  const { id }                    = useParams<{ id: string }>();
  const { t, language }           = useLanguage();
  const { listings, favorites, toggleFav, startThread } = useApp();
  const navigate                  = useNavigate();
  const [imgIdx,    setImgIdx]    = useState(0);
  const [msgOpen,   setMsgOpen]   = useState(false);
  const [msgText,   setMsgText]   = useState('');
  const [msgSent,   setMsgSent]   = useState(false);
  const [fullscreen,setFullscreen]= useState(false);

  const listing = listings.find(l => l.id === id) || listings[0];
  if (!listing) return <div className="p-8 text-center text-muted-foreground">Annonce introuvable</div>;

  const isFav    = favorites.includes(listing.id);
  const images   = listing.images?.length ? listing.images : [listing.imageUrl];
  const similar  = listings.filter(l => l.categoryId === listing.categoryId && l.id !== listing.id && l.status === 'active').slice(0, 4);
  const catId    = listing.categoryId;

  const prev = () => setImgIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setImgIdx(i => (i + 1) % images.length);

  const handleSendMsg = () => {
    if (!msgText.trim()) return;
    setMsgSent(true);
    navigate('/messages');
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-dz-green">{t.home}</Link>
          <span>/</span>
          <Link to={`/search?category=${catId}`} className="hover:text-dz-green">{listing.category}</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-xs">{listing.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Main column ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Image gallery */}
            <div className="bg-card rounded-2xl overflow-hidden border border-border">
              <div className="relative aspect-[16/9] bg-muted">
                <img
                  src={images[imgIdx]}
                  alt={listing.title}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setFullscreen(true)}
                />
                {/* Overlay top */}
                <div className="absolute top-3 left-3 flex gap-2 z-10">
                  {listing.isPremium && (
                    <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">✦ PREMIUM</span>
                  )}
                  {listing.isVerified && (
                    <span className="bg-dz-green text-white text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <ShieldCheck size={11} /> {t.verified}
                    </span>
                  )}
                  {listing.isUrgent && (
                    <span className="bg-dz-red text-white text-xs font-bold px-2 py-0.5 rounded-md animate-pulse">⚡ {t.urgent}</span>
                  )}
                </div>
                {/* Actions top-right */}
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  <button className="bg-black/30 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/50 transition">
                    <Share2 size={15} />
                  </button>
                  <button
                    onClick={() => toggleFav(listing.id)}
                    className={`p-2 rounded-full backdrop-blur-sm transition ${isFav ? 'bg-dz-red text-white' : 'bg-black/30 text-white hover:bg-black/50'}`}
                  >
                    <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
                  </button>
                </div>
                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <button onClick={prev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/50 transition">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={next}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/50 transition">
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
                {/* Dots */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)}
                        className={`rounded-full transition-all ${i === imgIdx ? 'bg-white w-4 h-1.5' : 'bg-white/50 w-1.5 h-1.5'}`} />
                    ))}
                  </div>
                )}
                <div className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-0.5 rounded-md backdrop-blur-sm">
                  📷 {imgIdx + 1}/{images.length}
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                      className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-dz-green' : 'border-transparent'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title + price */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-dz-green bg-dz-green/10 px-2 py-0.5 rounded-full">{listing.category}</span>
                  <h1 className="text-xl sm:text-2xl font-black text-foreground mt-2 leading-tight">{listing.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1"><MapPin size={13} /> {listing.location}</span>
                    <span className="flex items-center gap-1"><Clock size={13} /> {listing.date}</span>
                    {listing.views && <span className="flex items-center gap-1"><Eye size={13} /> {listing.views.toLocaleString()} {t.views}</span>}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-3xl font-black text-dz-green leading-none">
                    {listing.price.toLocaleString('fr-DZ')}
                  </div>
                  <div className="text-sm text-muted-foreground">DA</div>
                  {listing.negotiable && (
                    <span className="text-xs font-semibold text-dz-green">{t.negotiable}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-black text-foreground mb-4 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-dz-green inline-block" />
                {t.description}
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>

            {/* Attributes */}
            {listing.attributes && Object.keys(listing.attributes).length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-5">
                <h2 className="font-black text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-dz-green inline-block" />
                  Caractéristiques
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(listing.attributes).map(([k, v]) => (
                    <div key={k} className="bg-muted rounded-xl p-3 text-center">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{k}</div>
                      <div className="text-sm font-bold text-foreground">{String(v)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safety tip */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 flex gap-3">
              <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">{t.safetyTip}</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">{t.safetyTipText}</p>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            {/* Seller card */}
            <div className="bg-card rounded-2xl border border-border p-5 sticky top-[130px]">
              {/* Seller info */}
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border">
                <div className="relative">
                  <img src="https://api.dicebear.com/7.x/initials/svg?seed=Vendeur&backgroundColor=006233&textColor=ffffff" alt="Vendeur"
                    className="w-12 h-12 rounded-2xl object-cover" />
                  {listing.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-dz-green rounded-full flex items-center justify-center border-2 border-card">
                      <ShieldCheck size={10} strokeWidth={3} className="text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">Vendeur</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star size={10} className="text-amber-400" fill="currentColor" />
                    <span>4.8</span>
                    <span>·</span>
                    <span>{t.responseRate} {'<'} 1h</span>
                  </div>
                  {listing.isVerified && (
                    <span className="text-[10px] font-bold text-dz-green">{t.trustedSeller}</span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: t.memberSince, value: '2023' },
                  { label: t.views,       value: (listing.views || 0).toLocaleString() },
                ].map(s => (
                  <div key={s.label} className="bg-muted rounded-xl px-3 py-2 text-center">
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <div className="font-bold text-foreground text-sm">{s.value}</div>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="space-y-2.5">
                {msgSent ? (
                  <div className="bg-dz-green/10 border border-dz-green/20 rounded-xl p-3 text-center">
                    <CheckCircle2 size={18} className="text-dz-green mx-auto mb-1" />
                    <p className="text-sm font-bold text-dz-green">{t.sendMessage}</p>
                  </div>
                ) : (
                  <button onClick={() => setMsgOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-dz-green hover:bg-dz-green2 text-white font-bold rounded-xl transition-all shadow-brand-sm">
                    <MessageSquare size={16} />
                    {t.contactSeller}
                  </button>
                )}
                <button className="w-full flex items-center justify-center gap-2 py-3 border-2 border-border hover:border-dz-green text-foreground font-bold rounded-xl transition-all">
                  <Phone size={16} />
                  {t.callSeller}
                </button>
                <button onClick={() => toggleFav(listing.id)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all border
                    ${isFav ? 'bg-dz-red/10 text-dz-red border-dz-red/20' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                  <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
                  {isFav ? t.savedAd : t.saveAd}
                </button>
              </div>

              {/* Trust */}
              <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                <Lock size={12} className="text-dz-green shrink-0" />
                <span>Transaction sécurisée · Vendeur identifié</span>
              </div>

              <button className="w-full mt-3 text-xs text-muted-foreground hover:text-dz-red transition-colors flex items-center justify-center gap-1">
                <Flag size={11} /> {t.reportAd}
              </button>
            </div>
          </div>
        </div>

        {/* Similar listings */}
        {similar.length > 0 && (
          <section className="mt-10 mb-10">
            <h3 className="text-xl font-black text-foreground mb-5">{t.similarAds}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similar.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          </section>
        )}
      </div>

      {/* Contact modal */}
      {msgOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-card rounded-3xl p-6 w-full max-w-md shadow-2xl border border-border animate-fade-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-foreground">Contacter le vendeur</h3>
              <button onClick={() => setMsgOpen(false)} className="p-1.5 hover:bg-muted rounded-full">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
            <div className="bg-muted rounded-xl p-3 mb-4 text-sm text-muted-foreground">
              📋 <strong className="text-foreground">{listing.title}</strong> — {listing.price.toLocaleString()} DA
            </div>
            <textarea
              rows={4}
              value={msgText}
              onChange={e => setMsgText(e.target.value)}
              placeholder="Bonjour, est-ce que votre annonce est toujours disponible ?"
              className="w-full bg-muted border border-border rounded-xl p-3 text-sm outline-none focus:border-dz-green resize-none"
            />
            <button onClick={handleSendMsg}
              className="w-full mt-3 py-3 bg-dz-green hover:bg-dz-green2 text-white font-bold rounded-xl transition-all shadow-brand-sm">
              {t.sendMessage}
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center" onClick={() => setFullscreen(false)}>
          <img src={images[imgIdx]} className="max-w-full max-h-full object-contain" />
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full text-xl">‹</button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full text-xl">›</button>
          <button onClick={() => setFullscreen(false)} className="absolute top-4 right-4 bg-white/10 text-white p-2 rounded-full"><X size={20} /></button>
        </div>
      )}

      {/* Mobile sticky bar */}
      <div className="fixed bottom-16 md:hidden left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border p-3 flex gap-2 shadow-lg">
        <button className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-border text-foreground font-bold rounded-xl">
          <Phone size={16} /> {t.callSeller}
        </button>
        <button onClick={() => setMsgOpen(true)}
          className="flex-[2] flex items-center justify-center gap-2 py-3 bg-dz-green text-white font-bold rounded-xl shadow-brand-sm">
          <MessageSquare size={16} /> {t.contactSeller}
        </button>
      </div>
    </div>
  );
};

export default ListingDetailPage;
