import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import ListingCard from '../components/listing/ListingCard';

export const FavoritesPage: React.FC = () => {
  const { t, language }         = useLanguage();
  const { listings, favorites } = useApp();
  const favListings = listings.filter(l => favorites.includes(l.id));

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-black text-foreground">{t.myFavorites}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {favListings.length}{' '}
              {language === 'ar' ? 'إعلان' : language === 'en' ? `listing${favListings.length !== 1 ? 's' : ''}` : `annonce${favListings.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {favListings.length > 0 && (
            <Link to="/search" className="flex items-center gap-1.5 text-sm font-bold text-dz-green hover:underline">
              {language === 'ar' ? 'استكشاف المزيد' : language === 'en' ? 'Explore more' : 'Explorer plus'} <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* Empty state */}
        {favListings.length === 0 ? (
          <div className="text-center py-20 bg-card border-2 border-dashed border-border rounded-3xl">
            <div className="w-16 h-16 bg-dz-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={28} className="text-dz-red/50" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">
              {language === 'ar' ? 'لا توجد مفضلات بعد' : language === 'en' ? 'No favorites yet' : 'Aucun favori pour l\'instant'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xs mx-auto text-sm leading-relaxed">
              {language === 'ar' ? 'انقر على ♡ في أي إعلان لحفظه هنا وتتبع الأسعار.'
                : language === 'en' ? 'Click ♡ on any listing to save it here and track prices.'
                : 'Cliquez sur ♡ d\'une annonce pour la retrouver ici et suivre les prix.'}
            </p>
            <Link to="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-dz-green hover:bg-dz-green2 text-white font-bold rounded-2xl shadow-brand-sm transition-all">
              <Search size={16} />
              {language === 'ar' ? 'استكشاف الإعلانات' : language === 'en' ? 'Browse listings' : 'Explorer les annonces'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {favListings.map(l => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
