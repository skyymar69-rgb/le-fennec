import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart, Share2, Flag, MapPin, Clock, Eye, Phone, MessageSquare,
  ChevronLeft, ChevronRight, ShieldCheck, Star, X, CheckCircle2,
  ArrowLeft, Copy, Whatsapp, ExternalLink, ZoomIn, Tag, Sparkles,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import ListingCard from '../components/listing/ListingCard';
import { CATEGORIES } from '../data/categories';

const ListingDetailPage: React.FC = () => {
  const { id }       = useParams<{ id: string }>();
  const { t, language }                                   = useLanguage();
  const { listings, favorites, toggleFav, startThread }   = useApp();
  const navigate                                          = useNavigate();

  const [imgIdx,     setImgIdx]     = useState(0);
  const [lightbox,   setLightbox]   = useState(false);
  const [msgOpen,    setMsgOpen]    = useState(false);
  const [msgText,    setMsgText]    = useState('');
  const [msgSent,    setMsgSent]    = useState(false);
  const [shareOpen,  setShareOpen]  = useState(false);
  const [copied,     setCopied]     = useState(false);

  const listing = listings.find(l => l.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
    setImgIdx(0);
    setMsgSent(false);
    setMsgText('');
  }, [id]);

  if (!listing) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <p className="text-5xl">🦊</p>
        <p className="text-xl font-black text-foreground">Annonce introuvable</p>
        <Link to="/search" className="inline-block px-6 py-3 bg-dz-green text-white font-bold rounded-xl">
          Voir les annonces
        </Link>
      </div>
    </div>
  );

  const images   = listing.images?.length ? listing.images : [listing.imageUrl];
  const isFav    = favorites.includes(listing.id);
  const category = CATEGORIES.find(c => c.id === listing.categoryId);
  const similar  = listings.filter(l =>
    l.id !== listing.id && l.categoryId === listing.categoryId && l.wilayaId === listing.wilayaId
  ).slice(0, 4);

  const price    = listing.price === 0
    ? (language === 'ar' ? 'هدية مجانية' : 'Don gratuit 🎁')
    : `${listing.price.toLocaleString()} DA`;

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMsg = () => {
    if (!msgText.trim()) return;
    startThread?.(listing.id, listing.userId || 'demo', msgText);
    setMsgSent(true);
  };

  const prevImg = () => setImgIdx(i => (i - 1 + images.length) % images.length);
  const nextImg = () => setImgIdx(i => (i + 1) % images.length);

  return (
    <div className="min-h-screen bg-muted/30">

      {/* ── Breadcrumb ── */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-2 text-xs text-muted-foreground">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-foreground transition-colors font-medium">
            <ArrowLeft size={13}/> Retour
          </button>
          <span>/</span>
          <Link to="/search" className="hover:text-foreground transition-colors">Annonces</Link>
          {category && (
            <>
              <span>/</span>
              <Link to={`/search?category=${category.id}`} className="hover:text-foreground">
                {language === 'ar' ? category.nameAr : category.nameFr}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{listing.title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT — gallery + details ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* ── Image gallery ── */}
            <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-card">
              {/* Main image */}
              <div className="relative group" style={{ aspectRatio: '16/10' }}>
                <img
                  src={images[imgIdx]}
                  alt={`${listing.title} — photo ${imgIdx + 1}`}
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => setLightbox(true)}
                  loading="lazy"
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"/>

                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <ChevronLeft size={18}/>
                    </button>
                    <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <ChevronRight size={18}/>
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {listing.isPremium && (
                    <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1">
                      <Star size={9}/> Premium
                    </span>
                  )}
                  {listing.isUrgent && (
                    <span className="bg-dz-red text-white text-[10px] font-black px-2 py-1 rounded-full">
                      ⚡ Urgent
                    </span>
                  )}
                </div>

                {/* Photo counter + zoom hint */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <span className="bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <ZoomIn size={10}/>
                    {imgIdx + 1}/{images.length}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar bg-muted/40">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        i === imgIdx ? 'border-dz-green shadow-brand-sm' : 'border-transparent hover:border-dz-green/40'
                      }`}
                      aria-label={`Photo ${i + 1}`}
                      aria-pressed={i === imgIdx}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover"/>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Title + price (mobile) ── */}
            <div className="lg:hidden bg-card rounded-2xl border border-border p-5">
              <h1 className="text-xl font-black text-foreground leading-tight mb-3">{listing.title}</h1>
              <p className="text-3xl font-black text-dz-green mb-2">{price}</p>
              {listing.negotiable && listing.price > 0 && (
                <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-full">Négociable</span>
              )}
            </div>

            {/* ── Description ── */}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
              <h2 className="text-base font-black text-foreground mb-4 flex items-center gap-2">
                <span>📋</span> Description
              </h2>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* ── Attributes ── */}
            {listing.attributes && Object.keys(listing.attributes).length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
                <h2 className="text-base font-black text-foreground mb-4 flex items-center gap-2">
                  <Tag size={16}/> Caractéristiques
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(listing.attributes).map(([key, val]) => (
                    val ? (
                      <div key={key} className="flex flex-col bg-muted/60 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                          {key.replace(/_/g,' ')}
                        </span>
                        <span className="text-sm font-semibold text-foreground capitalize">
                          {String(val)}
                        </span>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            )}

            {/* ── Location ── */}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
              <h2 className="text-base font-black text-foreground mb-3 flex items-center gap-2">
                <MapPin size={16}/> Localisation
              </h2>
              <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                <div className="w-10 h-10 bg-dz-green/10 rounded-xl flex items-center justify-center">
                  <MapPin size={18} className="text-dz-green"/>
                </div>
                <div>
                  <p className="font-bold text-foreground">{listing.wilayaName || listing.location}</p>
                  {listing.commune && <p className="text-sm text-muted-foreground">{listing.commune}</p>}
                </div>
                <Link
                  to={`/search?wilaya=${listing.wilayaId}`}
                  className="ml-auto text-xs font-bold text-dz-green hover:underline flex items-center gap-1"
                >
                  Voir annonces <ExternalLink size={11}/>
                </Link>
              </div>
            </div>

            {/* ── Similar listings ── */}
            {similar.length > 0 && (
              <div>
                <h2 className="text-lg font-black text-foreground mb-4">
                  🔁 Annonces similaires
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {similar.map(l => <ListingCard key={l.id} listing={l}/>)}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT — sticky sidebar ── */}
          <div className="space-y-4">
            <div className="lg:sticky lg:top-[80px] space-y-4">

              {/* Price card */}
              <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-3xl font-black text-dz-green leading-tight">{price}</p>
                    {listing.negotiable && listing.price > 0 && (
                      <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-full mt-1 inline-block">
                        Négociable
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => toggleFav(listing.id)}
                      aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                        isFav
                          ? 'bg-dz-red/10 border-dz-red/30 text-dz-red'
                          : 'border-border text-muted-foreground hover:border-dz-red/30 hover:text-dz-red'
                      }`}
                    >
                      <Heart size={17} fill={isFav ? 'currentColor' : 'none'}/>
                    </button>
                    <button
                      onClick={() => setShareOpen(true)}
                      aria-label="Partager l'annonce"
                      className="w-10 h-10 rounded-xl border border-border text-muted-foreground hover:bg-muted flex items-center justify-center transition-all"
                    >
                      <Share2 size={17}/>
                    </button>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-5">
                  <span className="flex items-center gap-1"><Clock size={11}/> {listing.date}</span>
                  <span className="flex items-center gap-1"><Eye size={11}/> {(listing.views || 0).toLocaleString()} vues</span>
                  <span className="flex items-center gap-1"><MapPin size={11}/> {listing.wilayaName}</span>
                  {listing.condition && (
                    <span className="flex items-center gap-1 capitalize">
                      <Tag size={11}/>
                      {{new:'Neuf',like_new:'Comme neuf',good:'Bon état',fair:'Correct',used:'Occasion'}[listing.condition] || listing.condition}
                    </span>
                  )}
                </div>

                {/* CTA buttons */}
                <div className="space-y-2.5">
                  {listing.phone && (
                    <a
                      href={`tel:${listing.phone}`}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-dz-green hover:bg-dz-green2 text-white font-black rounded-2xl shadow-brand-md transition-all hover:-translate-y-0.5 active:scale-95"
                    >
                      <Phone size={18}/> Appeler le vendeur
                    </a>
                  )}
                  {listing.whatsapp && listing.phone && (
                    <a
                      href={`https://wa.me/${listing.phone?.replace(/\s/g, '')}?text=Bonjour, je suis intéressé par votre annonce : ${listing.title}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#25D366] hover:bg-[#1ebc5a] text-white font-black rounded-2xl transition-all hover:-translate-y-0.5 active:scale-95"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.004 2C6.477 2 2 6.477 2 12.004c0 1.774.465 3.484 1.346 4.99L2 22l5.19-1.33A9.964 9.964 0 0012.004 22C17.531 22 22 17.527 22 12.004 22 6.477 17.531 2 12.004 2zm0 18.007a7.99 7.99 0 01-4.09-1.124l-.293-.174-3.04.778.807-2.965-.192-.305A7.98 7.98 0 014 12.004C4 7.583 7.583 4 12.004 4c4.418 0 8 3.582 8 8.004 0 4.42-3.582 8.003-8 8.003z"/></svg>
                      WhatsApp
                    </a>
                  )}
                  <button
                    onClick={() => setMsgOpen(true)}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 border-2 border-dz-green text-dz-green hover:bg-dz-green/5 font-black rounded-2xl transition-all active:scale-95"
                  >
                    <MessageSquare size={18}/> Envoyer un message
                  </button>
                </div>
              </div>

              {/* Seller card */}
              <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
                <h3 className="text-sm font-black text-foreground mb-4 flex items-center gap-2">
                  👤 À propos du vendeur
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-dz-green/10 rounded-2xl flex items-center justify-center">
                    <span className="text-xl font-black text-dz-green">
                      {listing.userId === 'demo' ? '🦊' : '👤'}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-foreground">
                      {listing.userId === 'demo' ? 'Vendeur vérifié' : 'Particulier'}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {listing.isVerified && (
                        <span className="flex items-center gap-0.5 text-[10px] text-dz-green font-bold">
                          <ShieldCheck size={10}/> Identité vérifiée
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Trust score */}
                <div className="bg-muted/50 rounded-xl p-3">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-bold text-muted-foreground">Score de confiance</span>
                    <span className="text-xs font-black text-dz-green">
                      {listing.ranking?.trustScore || 0}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-dz-green rounded-full transition-all"
                      style={{ width: `${listing.ranking?.trustScore || 0}%` }}
                    />
                  </div>
                </div>

                <Link
                  to={`/search?userId=${listing.userId}`}
                  className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 border border-border rounded-xl text-sm font-bold text-foreground hover:bg-muted transition-colors"
                >
                  Voir toutes ses annonces
                </Link>
              </div>

              {/* Safety tips */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4">
                <p className="text-xs font-black text-amber-800 dark:text-amber-300 mb-2">
                  🛡️ Conseils de sécurité
                </p>
                <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1 leading-relaxed">
                  <li>• Vérifiez l'article avant tout paiement</li>
                  <li>• Rencontrez dans un lieu public</li>
                  <li>• Méfiez-vous des paiements à l'avance</li>
                </ul>
                <button className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline mt-2">
                  <Flag size={11}/> Signaler cette annonce
                </button>
              </div>

              {/* ID + date */}
              <p className="text-center text-[10px] text-muted-foreground">
                Annonce #{listing.id} · Publiée {listing.date}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Message modal ── */}
      {msgOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setMsgOpen(false)}>
          <div className="bg-card rounded-3xl border border-border w-full max-w-md p-6 shadow-2xl animate-fade-up" onClick={e => e.stopPropagation()}>
            {!msgSent ? (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-foreground">Contacter le vendeur</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{listing.title}</p>
                  </div>
                  <button onClick={() => setMsgOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X size={20}/>
                  </button>
                </div>
                <div className="flex flex-col gap-2 mb-4">
                  {[
                    'Bonjour, est-ce encore disponible ?',
                    'Quel est votre meilleur prix ?',
                    'Je suis intéressé, pouvons-nous nous voir ?',
                  ].map(s => (
                    <button key={s} onClick={() => setMsgText(s)}
                      className="text-left text-sm px-4 py-2.5 bg-muted hover:bg-dz-green/10 hover:text-dz-green border border-border hover:border-dz-green/30 rounded-xl transition-all font-medium">
                      {s}
                    </button>
                  ))}
                </div>
                <textarea
                  value={msgText} onChange={e => setMsgText(e.target.value)}
                  placeholder="Écrivez votre message…"
                  rows={3}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dz-green resize-none mb-4"
                />
                <button
                  onClick={handleSendMsg}
                  disabled={!msgText.trim()}
                  className="w-full py-3.5 bg-dz-green hover:bg-dz-green2 text-white font-black rounded-2xl shadow-brand-md disabled:opacity-50 transition-all"
                >
                  Envoyer le message
                </button>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-dz-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-dz-green"/>
                </div>
                <h3 className="font-black text-foreground text-lg mb-2">Message envoyé !</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Le vendeur vous répondra dans votre messagerie.
                </p>
                <button onClick={() => { setMsgOpen(false); navigate('/messages'); }}
                  className="px-6 py-3 bg-dz-green text-white font-bold rounded-xl">
                  Voir ma messagerie
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Share modal ── */}
      {shareOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShareOpen(false)}>
          <div className="bg-card rounded-3xl border border-border w-full max-w-sm p-6 shadow-2xl animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-black text-foreground">Partager l'annonce</h3>
              <button onClick={() => setShareOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={20}/></button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label:'WhatsApp', color:'#25D366', icon:'💬',
                  href:`https://wa.me/?text=${encodeURIComponent(listing.title + ' — ' + window.location.href)}` },
                { label:'Facebook', color:'#1877F2', icon:'📘',
                  href:`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}` },
                { label:'Telegram', color:'#0088cc', icon:'✈️',
                  href:`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(listing.title)}` },
              ].map(p => (
                <a key={p.label} href={p.href} target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border hover:bg-muted transition-colors">
                  <span className="text-2xl">{p.icon}</span>
                  <span className="text-xs font-bold text-muted-foreground">{p.label}</span>
                </a>
              ))}
            </div>
            <button onClick={copyLink}
              className="w-full flex items-center justify-center gap-2 py-3 border border-border rounded-xl text-sm font-bold hover:bg-muted transition-colors">
              <Copy size={15}/>
              {copied ? '✓ Lien copié !' : 'Copier le lien'}
            </button>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 text-white/70 hover:text-white"><X size={28}/></button>
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prevImg(); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"><ChevronLeft size={36}/></button>
              <button onClick={e => { e.stopPropagation(); nextImg(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"><ChevronRight size={36}/></button>
            </>
          )}
          <img src={images[imgIdx]} alt={listing.title} className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl" onClick={e => e.stopPropagation()}/>
          <p className="absolute bottom-4 text-white/50 text-sm">{imgIdx + 1} / {images.length}</p>
        </div>
      )}
    </div>
  );
};

export default ListingDetailPage;
