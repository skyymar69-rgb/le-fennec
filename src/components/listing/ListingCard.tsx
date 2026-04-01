import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Zap, TrendingUp, Heart, Camera, Eye } from 'lucide-react';
import { Listing } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface ListingCardProps {
  listing:          Listing;
  layout?:          'grid' | 'list';
  showRanking?:     boolean;
}

const CONDITION_LABELS: Record<string, { fr: string; ar: string; en: string; color: string }> = {
  new:       { fr: 'Neuf',        ar: 'جديد',     en: 'New',       color: '#10B981' },
  like_new:  { fr: 'Comme neuf',  ar: 'كالجديد',  en: 'Like new',  color: '#3B82F6' },
  good:      { fr: 'Bon état',    ar: 'حالة جيدة', en: 'Good',      color: '#8B5CF6' },
  fair:      { fr: 'Correct',     ar: 'مقبول',     en: 'Fair',      color: '#F59E0B' },
  used:      { fr: 'Occasion',    ar: 'مستعمل',    en: 'Used',      color: '#6B7280' },
};

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  layout = 'grid',
  showRanking = false,
}) => {
  const { favorites, toggleFav } = useApp();
  const { language }              = useLanguage();
  const isFav  = favorites.includes(listing.id);
  const isList = layout === 'list';

  const conditionInfo = listing.condition ? CONDITION_LABELS[listing.condition] : null;
  const conditionLabel = conditionInfo
    ? (language === 'ar' ? conditionInfo.ar : language === 'en' ? conditionInfo.en : conditionInfo.fr)
    : null;

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFav(listing.id);
  };

  return (
    <Link
      to={`/listing/${listing.id}`}
      className={`group bg-card rounded-2xl border border-border overflow-hidden transition-all duration-200 card-hover block
        ${isList ? 'flex h-36 sm:h-40' : 'flex flex-col h-full'}`}
    >
      {/* Image */}
      <div className={`relative overflow-hidden bg-muted ${isList ? 'w-36 sm:w-48 shrink-0' : 'aspect-[4/3]'}`}>
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Badges top-left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          {listing.ranking.boostLevel > 0 && (
            <span className="inline-flex items-center gap-1 bg-dz-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              <TrendingUp size={9} strokeWidth={3} />
              {language === 'ar' ? 'ممول' : language === 'en' ? 'PROMO' : 'PROMO'}
            </span>
          )}
          {listing.isUrgent && (
            <span className="inline-flex items-center gap-1 bg-dz-red text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm animate-pulse">
              <Zap size={9} fill="currentColor" />
              {language === 'ar' ? 'عاجل' : language === 'en' ? 'URGENT' : 'URGENT'}
            </span>
          )}
          {listing.isPremium && (
            <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              ✦ {language === 'ar' ? 'مميز' : language === 'en' ? 'PREMIUM' : 'PREMIUM'}
            </span>
          )}
        </div>

        {/* Favorite */}
        <button
          onClick={handleFav}
          aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full shadow-sm backdrop-blur-sm transition-all
            ${isFav
              ? 'bg-dz-red/90 text-white scale-110'
              : 'bg-white/80 text-gray-500 hover:text-dz-red opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0'
            }`}
        >
          <Heart size={13} fill={isFav ? 'currentColor' : 'none'} />
        </button>

        {/* Verified bottom-left */}
        {listing.isVerified && (
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1">
            <div className="w-4 h-4 bg-dz-green rounded-full flex items-center justify-center">
              <ShieldCheck size={10} strokeWidth={3} className="text-white" />
            </div>
            <span className="text-[9px] font-bold text-white/90 uppercase tracking-wide">
              {language === 'ar' ? 'موثق' : language === 'en' ? 'Verified' : 'Vérifié'}
            </span>
          </div>
        )}

        {/* Photo count */}
        {listing.images?.length > 1 && (
          <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-md">
            <Camera size={9} />
            {listing.images.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col flex-1 p-3 ${isList ? 'justify-between' : ''} min-w-0`}>
        {/* Category + date */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-dz-green bg-dz-green/10 px-2 py-0.5 rounded-full uppercase tracking-wide truncate">
            {listing.category}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0 ml-1">{listing.date}</span>
        </div>

        {/* Title */}
        <h3 className={`font-bold text-foreground leading-tight group-hover:text-dz-green transition-colors truncate-2
          ${isList ? 'text-sm' : 'text-sm line-clamp-2'}`}
          style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
        >
          {listing.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 mb-2">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate">{listing.location}</span>
        </div>

        {/* Bottom row */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-border/50">
          <div>
            <div className="text-base font-extrabold text-foreground group-hover:text-dz-green transition-colors leading-none">
              {listing.price === 0
                ? <span className="text-dz-green text-sm font-bold">Gratuit</span>
                : <>{listing.price.toLocaleString('fr-DZ')} <span className="text-xs font-medium text-muted-foreground">DA</span></>
              }
            </div>
            {listing.negotiable && (
              <span className="text-[9px] text-dz-green font-semibold">
                {language === 'ar' ? 'قابل للتفاوض' : language === 'en' ? 'Negotiable' : 'Négociable'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {conditionLabel && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                style={{ background: conditionInfo!.color + '18', color: conditionInfo!.color }}
              >
                {conditionLabel}
              </span>
            )}
            {listing.ranking.trustScore > 0 && (
              <div
                className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-bold shrink-0"
                style={{ borderColor: '#BBF7D0', color: '#006233' }}
                title="Score de confiance"
              >
                {listing.ranking.trustScore}
              </div>
            )}
          </div>
        </div>

        {/* Views */}
        {listing.views !== undefined && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
            <Eye size={9} />
            {listing.views.toLocaleString()}
          </div>
        )}

        {/* Debug ranking */}
        {showRanking && listing.ranking.totalScore && (
          <div className="text-[8px] text-muted-foreground font-mono mt-1">
            Score:{Math.round(listing.ranking.totalScore)} T:{listing.ranking.trustScore} Q:{listing.ranking.qualityScore}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ListingCard;
