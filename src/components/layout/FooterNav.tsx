import logoUrl from "../../assets/logo.png";
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, Plus, Heart, User } from 'lucide-react';
import Logo from '../ui/Logo';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import { CATEGORIES } from '../../data/categories';
import { WILAYAS, POPULAR_WILAYAS } from '../../data/wilayas';

/* ══════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════ */
export const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  const catName = (cat: (typeof CATEGORIES)[0]) =>
    language === 'ar' ? cat.nameAr : language === 'en' ? cat.nameEn : cat.nameFr;

  const popularWilayas = WILAYAS.filter(w => POPULAR_WILAYAS.includes(w.code));
  const wilayaName = (w: (typeof WILAYAS)[0]) =>
    language === 'ar' ? w.nameAr : language === 'en' ? w.nameEn : w.nameFr;

  return (
    <footer className="bg-card border-t border-border mt-auto hidden md:block">
      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <img src={logoUrl} alt="Le Fennec" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" />
              <Logo size="md" showTagline />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-5">
              {language === 'ar'
                ? 'منصة الإعلانات المبوبة المرجعية في الجزائر. مجانية، سهلة ومعتمدة على الذكاء الاصطناعي.'
                : language === 'en'
                ? 'The reference classifieds platform in Algeria. Free, simple and AI-powered.'
                : 'La plateforme de référence pour les petites annonces en Algérie. Gratuite, simple et propulsée par IA.'}
            </p>
            {/* Social */}
            <div className="flex gap-2">
              {['📘','📸','🐦','▶️'].map((icon, i) => (
                <button key={i}
                  className="w-8 h-8 rounded-lg bg-muted hover:bg-muted-foreground/20 flex items-center justify-center text-sm transition-colors"
                  aria-label="social"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">{t.category}</h4>
            <ul className="space-y-2.5">
              {CATEGORIES.slice(0, 6).map(cat => (
                <li key={cat.id}>
                  <Link
                    to={`/search?category=${cat.id}`}
                    className="text-sm text-muted-foreground hover:text-dz-green transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-xs">{cat.icon}</span>
                    {catName(cat)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Wilayas */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">
              {language === 'ar' ? 'الولايات' : language === 'en' ? 'Wilayas' : 'Wilayas'}
            </h4>
            <ul className="space-y-2.5">
              {popularWilayas.slice(0, 6).map(w => (
                <li key={w.code}>
                  <Link
                    to={`/search?wilaya=${w.code}`}
                    className="text-sm text-muted-foreground hover:text-dz-green transition-colors"
                  >
                    {wilayaName(w)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Legal */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">
              {language === 'ar' ? 'مساعدة وقانون' : language === 'en' ? 'Help & Legal' : 'Aide & Légal'}
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: language === 'ar' ? 'مركز المساعدة' : language === 'en' ? 'Help center' : "Centre d'aide",        to:'/help'    },
                { label: language === 'ar' ? 'الشروط العامة'  : language === 'en' ? 'Terms of use'  : 'CGU',                 to:'/legal/terms' },
                { label: language === 'ar' ? 'الخصوصية'       : language === 'en' ? 'Privacy'        : 'Confidentialité',    to:'/legal/privacy' },
                { label: language === 'ar' ? 'الإبلاغ'        : language === 'en' ? 'Report fraud'   : 'Signaler fraude',    to:'/report'  },
                { label: language === 'ar' ? 'اتصل بنا'       : language === 'en' ? 'Contact us'     : 'Nous contacter',     to:'/contact' },
              ].map(item => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-muted-foreground hover:text-dz-green transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © 2025 Le Fennec — {language === 'ar' ? 'جميع الحقوق محفوظة · 🇩🇿 صُنع في الجزائر' : language === 'en' ? 'All rights reserved · 🇩🇿 Made in Algeria' : 'Tous droits réservés · 🇩🇿 Made in Algeria'}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="text-sm">🤖</span>
            {language === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : language === 'en' ? 'AI-powered' : 'Propulsé par IA'}
          </div>
        </div>
      </div>
    </footer>
  );
};

/* ══════════════════════════════════════════════════════════
   BOTTOM NAV (mobile)
══════════════════════════════════════════════════════════ */
export const BottomNav: React.FC = () => {
  const { t }                   = useLanguage();
  const { favorites, threads }  = useApp();
  const unread = threads.reduce((s, th) => s + th.unread, 0);

  const items = [
    { to: '/',          icon: Home,          label: t.home,      badge: 0              },
    { to: '/search',    icon: Search,        label: t.search,    badge: 0              },
    { to: '/post',      icon: Plus,          label: t.post,      badge: 0, primary: true },
    { to: '/favorites', icon: Heart,         label: t.favorites, badge: favorites.length },
    { to: '/dashboard', icon: User,          label: t.profile,   badge: unread         },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50 md:hidden safe-area-bottom shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-end justify-around h-16 pb-2 px-1">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all
                ${item.primary ? '-translate-y-3' : ''}`}
            >
              {item.primary ? (
                <div className="w-12 h-12 rounded-full bg-dz-green flex items-center justify-center shadow-brand-md border-4 border-card active:scale-95 transition-transform">
                  <Icon size={22} strokeWidth={2.5} className="text-white" />
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Icon size={21} strokeWidth={2} className="text-muted-foreground" />
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-dz-red text-white text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-medium text-muted-foreground">{item.label}</span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
