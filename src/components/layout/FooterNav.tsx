import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, Plus, Heart, User, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import { CATEGORIES } from '../../data/categories';
import { WILAYAS, POPULAR_WILAYAS } from '../../data/wilayas';
import logoUrl from '../../assets/logo.png';

const KAYZEN = {
  web:    'https://www.kayzen-lyon.fr',
  agency: 'https://internet.kayzen-lyon.fr',
  phone:  '+33 (0)4 87 77 68 61',
  email:  'contact@kayzen-lyon.fr',
  addr:   '6, rue Pierre Termier — 69009 Lyon, France',
};

export const Footer: React.FC = () => {
  const { language } = useLanguage();

  const catName = (cat: (typeof CATEGORIES)[0]) =>
    language === 'ar' ? cat.nameAr : language === 'en' ? cat.nameEn : cat.nameFr;

  const popularWilayas = WILAYAS.filter(w => POPULAR_WILAYAS.includes(w.code));
  const wilayaName = (w: typeof WILAYAS[0]) =>
    language === 'ar' ? w.nameAr : language === 'en' ? w.nameEn : w.nameFr;

  return (
    <footer className="bg-card border-t border-border hidden md:block" aria-label="Pied de page">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <img src={logoUrl} alt="Le Fennec DZ Market" className="h-12 w-auto object-contain group-hover:scale-105 transition-transform" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-4">
              {language === 'ar'
                ? 'المنصة الجزائرية المرجعية للإعلانات المبوبة المجانية. مجانية، بسيطة ومدعومة بالذكاء الاصطناعي.'
                : language === 'en'
                ? 'Algeria\'s reference classifieds platform. Free, simple and AI-powered.'
                : 'La plateforme de référence pour les annonces classées en Algérie. Gratuite, simple et propulsée par IA.'}
            </p>
            {/* Contact */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <a href={`mailto:${KAYZEN.email}`} className="flex items-center gap-2 hover:text-dz-green transition-colors">
                <Mail size={12} className="shrink-0" /> {KAYZEN.email}
              </a>
              <a href={`tel:${KAYZEN.phone.replace(/\s/g,'')}`} className="flex items-center gap-2 hover:text-dz-green transition-colors">
                <Phone size={12} className="shrink-0" /> {KAYZEN.phone}
              </a>
              <p className="flex items-start gap-2">
                <MapPin size={12} className="shrink-0 mt-0.5" /> {KAYZEN.addr}
              </p>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">
              {language === 'ar' ? 'الفئات' : language === 'en' ? 'Categories' : 'Catégories'}
            </h4>
            <ul className="space-y-2.5">
              {CATEGORIES.slice(0, 7).map(cat => (
                <li key={cat.id}>
                  <Link to={`/search?category=${cat.id}`}
                    className="text-sm text-muted-foreground hover:text-dz-green transition-colors flex items-center gap-1.5">
                    <span className="text-xs">{cat.icon}</span> {catName(cat)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Wilayas */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Wilayas</h4>
            <ul className="space-y-2.5">
              {popularWilayas.slice(0, 7).map(w => (
                <li key={w.code}>
                  <Link to={`/search?wilaya=${w.code}`}
                    className="text-sm text-muted-foreground hover:text-dz-green transition-colors">
                    {wilayaName(w)}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/search" className="text-sm font-semibold text-dz-green hover:underline">
                  Toutes les wilayas →
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Legal */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">
              {language === 'ar' ? 'مساعدة وقانون' : language === 'en' ? 'Help & Legal' : 'Aide & Légal'}
            </h4>
            <ul className="space-y-2.5">
              <li><Link to="/post"    className="text-sm text-muted-foreground hover:text-dz-green transition-colors">Déposer une annonce</Link></li>
              <li><Link to="/auth"    className="text-sm text-muted-foreground hover:text-dz-green transition-colors">Créer un compte</Link></li>
              <li><Link to="/search"  className="text-sm text-muted-foreground hover:text-dz-green transition-colors">Rechercher</Link></li>
              <li className="pt-2 border-t border-border">
                <Link to="/legal/mentions"        className="text-sm text-muted-foreground hover:text-dz-green transition-colors">Mentions légales</Link>
              </li>
              <li><Link to="/legal/cgu"           className="text-sm text-muted-foreground hover:text-dz-green transition-colors">CGU</Link></li>
              <li><Link to="/legal/cgv"           className="text-sm text-muted-foreground hover:text-dz-green transition-colors">CGV</Link></li>
              <li><Link to="/legal/confidentialite" className="text-sm text-muted-foreground hover:text-dz-green transition-colors">Confidentialité</Link></li>
              <li className="pt-2 border-t border-border">
                <a href={KAYZEN.web} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-dz-green transition-colors flex items-center gap-1">
                  KAYZEN LYON <ExternalLink size={10} />
                </a>
              </li>
              <li>
                <a href={KAYZEN.agency} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-dz-green transition-colors flex items-center gap-1">
                  Agence Web <ExternalLink size={10} />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} Le Fennec DZ Market — Tous droits réservés ·{' '}
            <span className="text-dz-green font-semibold">🇩🇿 Fait pour l'Algérie</span>{' '}·{' '}
            Conçu par{' '}
            <a href={KAYZEN.web} target="_blank" rel="noopener noreferrer" className="hover:text-dz-green underline">KAYZEN LYON</a>
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-sm">🤖</span>
            Propulsé par Claude AI (Anthropic)
          </div>
        </div>
      </div>
    </footer>
  );
};

/* ── Bottom Nav (mobile) ── */
export const BottomNav: React.FC = () => {
  const { t }                   = useLanguage();
  const { favorites, threads }  = useApp();
  const unread = threads.reduce((s, t) => s + t.unread, 0);

  const items = [
    { to:'/',          Icon:Home,  label:t.home },
    { to:'/search',    Icon:Search,label:t.search },
    { to:'/post',      Icon:Plus,  label:t.post, primary:true },
    { to:'/favorites', Icon:Heart, label:t.favorites, badge:favorites.length },
    { to:'/dashboard', Icon:User,  label:t.profile,   badge:unread },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50 md:hidden"
      style={{ paddingBottom:'env(safe-area-inset-bottom)' }}
      aria-label="Navigation mobile">
      <div className="flex items-end justify-around h-14 px-2">
        {items.map(item => {
          const IconC = item.Icon;
          return (
            <Link key={item.to} to={item.to}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all ${item.primary ? '-translate-y-3' : ''}`}>
              {item.primary ? (
                <div className="w-12 h-12 rounded-full bg-dz-green flex items-center justify-center shadow-brand-md border-4 border-card active:scale-95 transition-transform">
                  <IconC size={22} strokeWidth={2.5} className="text-white" />
                </div>
              ) : (
                <>
                  <div className="relative">
                    <IconC size={20} strokeWidth={1.8} className="text-muted-foreground" />
                    {item.badge != null && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1.5 bg-dz-red text-white text-[8px] font-bold min-w-[14px] h-3.5 flex items-center justify-center rounded-full px-0.5">
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
