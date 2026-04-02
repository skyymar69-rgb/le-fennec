import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Camera, Eye, Star, Zap, Clock, ShieldCheck, Tag } from 'lucide-react';
import type { Listing } from '../../types';
import { useApp }      from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';

const CONDITIONS: Record<string,{fr:string;ar:string;en:string;bg:string;text:string}> = {
  new:      { fr:'Neuf',       ar:'جديد',    en:'New',       bg:'#DCFCE7', text:'#16A34A' },
  like_new: { fr:'Comme neuf', ar:'كالجديد', en:'Like new',  bg:'#DBEAFE', text:'#2563EB' },
  good:     { fr:'Bon état',   ar:'جيد',     en:'Good',      bg:'#EDE9FE', text:'#7C3AED' },
  fair:     { fr:'Correct',    ar:'مقبول',   en:'Fair',      bg:'#FEF3C7', text:'#D97706' },
  used:     { fr:'Occasion',   ar:'مستعمل',  en:'Used',      bg:'#F3F4F6', text:'#6B7280' },
};

interface Props {
  listing: Listing;
  layout?: 'grid' | 'list';
}

const ListingCard: React.FC<Props> = ({ listing, layout = 'grid' }) => {
  const { favorites, toggleFav } = useApp();
  const { language }              = useLanguage();
  const [imgErr, setImgErr]       = useState(false);
  const [hovered, setHovered]     = useState(false);

  const isFav   = favorites.includes(listing.id);
  const cond    = listing.condition ? CONDITIONS[listing.condition] : null;
  const condLbl = cond ? (language === 'ar' ? cond.ar : language === 'en' ? cond.en : cond.fr) : null;

  const price = listing.price === 0
    ? (language === 'ar' ? 'مجاني 🎁' : 'Gratuit 🎁')
    : `${listing.price.toLocaleString()} DA`;

  const imgSrc = (!imgErr && listing.imageUrl) ? listing.imageUrl : `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=60`;

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFav(listing.id);
  };

  // ── LIST layout ────────────────────────────────────────────────────────
  if (layout === 'list') {
    return (
      <Link to={`/listing/${listing.id}`}
        className="group flex bg-card border border-border hover:border-dz-green/40 rounded-2xl overflow-hidden transition-all hover:shadow-card-hover">
        {/* Image */}
        <div className="w-36 sm:w-44 shrink-0 relative overflow-hidden bg-muted">
          <img src={imgSrc} alt={listing.title} onError={() => setImgErr(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ aspectRatio: '4/3' }} loading="lazy"/>
          {listing.isPremium && (
            <div className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <Star size={8}/> PREMIUM
            </div>
          )}
          {listing.isUrgent && (
            <div className="absolute top-2 right-2 bg-dz-red text-white text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <Zap size={8}/> URGENT
            </div>
          )}
          {(listing.images?.length || 0) > 1 && (
            <div className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <Camera size={9}/> {listing.images!.length}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug group-hover:text-dz-green transition-colors">
                {listing.title}
              </h3>
              <button onClick={handleFav} className="shrink-0 p-1.5 hover:bg-muted rounded-full transition-colors ml-1">
                <Heart size={15} className={isFav ? 'text-dz-red fill-dz-red' : 'text-muted-foreground'}
                  fill={isFav ? 'currentColor' : 'none'}/>
              </button>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
              {listing.description}
            </p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className={`text-base font-black ${listing.price === 0 ? 'text-dz-green' : 'text-foreground'}`}>
              {price}
            </span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {condLbl && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: cond!.bg, color: cond!.text }}>
                  {condLbl}
                </span>
              )}
              <span className="flex items-center gap-1"><MapPin size={10}/>{listing.wilayaName || listing.location}</span>
              <span className="flex items-center gap-1"><Clock size={10}/>{listing.date}</span>
              {(listing.views || 0) > 0 && (
                <span className="flex items-center gap-1"><Eye size={10}/>{listing.views}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ── GRID layout ────────────────────────────────────────────────────────
  return (
    <Link to={`/listing/${listing.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex flex-col bg-card border border-border hover:border-dz-green/40 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">

      {/* Image zone */}
      <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: '4/3' }}>
        <img
          src={imgSrc} alt={listing.title}
          onError={() => setImgErr(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {listing.isPremium && (
            <span className="flex items-center gap-1 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
              <Star size={8}/> PREMIUM
            </span>
          )}
          {listing.isUrgent && (
            <span className="flex items-center gap-1 bg-dz-red text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
              <Zap size={8}/> URGENT
            </span>
          )}
          {listing.isVerified && (
            <span className="flex items-center gap-1 bg-dz-green text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
              <ShieldCheck size={8}/> VÉRIFIÉ
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={handleFav}
          aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
            isFav
              ? 'bg-dz-red text-white'
              : 'bg-white/90 text-gray-400 hover:text-dz-red hover:bg-white opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart size={14} fill={isFav ? 'currentColor' : 'none'}/>
        </button>

        {/* Photo count */}
        {(listing.images?.length || 0) > 1 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
            <Camera size={9}/> {listing.images!.length}
          </div>
        )}

        {/* Condition pill bottom-left */}
        {condLbl && (
          <div className="absolute bottom-2 left-2">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm"
              style={{ background: cond!.bg, color: cond!.text }}>
              {condLbl}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5">
        {/* Price */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className={`text-lg font-black leading-none ${listing.price === 0 ? 'text-dz-green' : 'text-foreground'}`}>
            {price}
          </span>
          {listing.negotiable && listing.price > 0 && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium shrink-0">
              Négociable
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-dz-green transition-colors">
          {listing.title}
        </h3>

        {/* Meta */}
        <div className="mt-auto pt-2 border-t border-border/50 flex items-center justify-between gap-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1 truncate">
            <MapPin size={10} className="shrink-0"/>
            <span className="truncate">{listing.wilayaName || listing.location}</span>
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {(listing.views || 0) > 0 && (
              <span className="flex items-center gap-0.5">
                <Eye size={10}/>{listing.views}
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <Clock size={10}/>{listing.date}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
