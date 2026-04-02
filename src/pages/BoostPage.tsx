import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Zap, Star, Crown, Package, Check, ArrowRight,
  TrendingUp, Eye, Phone, ChevronRight, Shield, Clock,
} from 'lucide-react';
import { useApp }      from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';

// ── Plans ────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id:       'urgent',
    icon:     Zap,
    color:    '#EF4444',
    bgColor:  'bg-red-50 dark:bg-red-950/20',
    badge:    null,
    nameFr:   'Urgent',
    nameAr:   'عاجل',
    price:    500,
    duration: 7,
    features: [
      'Badge "URGENT" rouge sur votre annonce',
      'Priorité dans les résultats de recherche',
      'Notification push aux acheteurs locaux',
      'Durée : 7 jours',
    ],
    stats: { visibility: '+85%', contacts: '+3×' },
  },
  {
    id:       'top',
    icon:     Star,
    color:    '#F59E0B',
    bgColor:  'bg-amber-50 dark:bg-amber-950/20',
    badge:    'Populaire',
    nameFr:   'Top Annonce',
    nameAr:   'إعلان مميز',
    price:    1200,
    duration: 14,
    features: [
      'Position en tête des résultats',
      'Badge étoile doré visible',
      'Mise en avant sur la page d\'accueil',
      'Statistiques avancées (vues, clics)',
      'Durée : 14 jours',
    ],
    stats: { visibility: '+250%', contacts: '+7×' },
  },
  {
    id:       'premium',
    icon:     Crown,
    color:    '#8B5CF6',
    bgColor:  'bg-purple-50 dark:bg-purple-950/20',
    badge:    'Meilleur ROI',
    nameFr:   'Premium',
    nameAr:   'بريميوم',
    price:    2500,
    duration: 30,
    features: [
      'Tête de toutes les listes · 30 jours',
      'Badge "PREMIUM" violet distinctif',
      'Mise en avant Email hebdomadaire',
      'Statistiques complètes + export',
      'Support prioritaire WhatsApp',
      'Partage réseaux sociaux automatique',
    ],
    stats: { visibility: '+500%', contacts: '+15×' },
  },
  {
    id:       'pack',
    icon:     Package,
    color:    '#006233',
    bgColor:  'bg-dz-green/5',
    badge:    'Économie 40%',
    nameFr:   'Pack Pro',
    nameAr:   'حزمة الاحتراف',
    price:    5000,
    duration: 90,
    features: [
      '5 annonces Premium simultanées',
      'Toutes les fonctionnalités Premium',
      'Badge "Vendeur Pro" sur votre profil',
      'Page profil personnalisée',
      'Accès API pour pros (agences, concess.)',
      'Durée : 90 jours + renouvellement auto',
    ],
    stats: { visibility: '+800%', contacts: '+25×' },
  },
];

// ── Payment methods ───────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'ccp',      label: 'CCP / Algérie Poste', icon: '🏦', available: true  },
  { id: 'baridimob',label: 'BaridiMob',            icon: '📱', available: true  },
  { id: 'dahabiya', label: 'Dahabia',              icon: '💳', available: true  },
  { id: 'edahabia', label: 'E-Dinar',              icon: '💰', available: true  },
  { id: 'stripe',   label: 'Carte bancaire',       icon: '🌍', available: false },
];

// ────────────────────────────────────────────────────────────────────────
export const BoostPage: React.FC = () => {
  const { user, listings }      = useApp();
  const { language }            = useLanguage();
  const [searchParams]          = useSearchParams();
  const [selected,  setSelected]= useState<string>('top');
  const [payment,   setPayment] = useState<string>('ccp');
  const [step,      setStep]    = useState<'choose' | 'listing' | 'pay' | 'confirm'>('choose');
  const [listingId, setListingId] = useState<string>(searchParams.get('listing') || '');

  const myListings = listings.filter(l => l.userId === user?.id);
  const plan       = PLANS.find(p => p.id === selected)!;
  const listing    = listings.find(l => l.id === listingId);

  // ── Not logged in ──
  if (!user) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 text-center p-6">
      <Crown size={40} className="text-dz-green"/>
      <h2 className="text-xl font-black text-foreground">Boostez vos annonces</h2>
      <p className="text-muted-foreground text-sm max-w-xs">
        Connectez-vous pour accéder aux options de mise en avant.
      </p>
      <Link to="/auth" className="px-6 py-3 bg-dz-green text-white font-black rounded-xl shadow-brand-md">
        Se connecter
      </Link>
    </div>
  );

  // ── Confirmation step ──
  if (step === 'confirm') return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center p-6">
      <div className="w-20 h-20 bg-dz-green/10 rounded-full flex items-center justify-center">
        <Check size={40} className="text-dz-green"/>
      </div>
      <div>
        <h2 className="text-2xl font-black text-foreground mb-2">Commande enregistrée !</h2>
        <p className="text-muted-foreground leading-relaxed max-w-sm">
          Votre demande de boost <strong>{plan.nameFr}</strong> a été enregistrée.
          Dès réception de votre paiement via <strong>{PAYMENT_METHODS.find(m=>m.id===payment)?.label}</strong>,
          votre annonce sera propulsée en tête des résultats.
        </p>
      </div>
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 max-w-sm text-left">
        <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-2">Instructions de paiement :</p>
        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
          Envoyez <strong>{plan.price.toLocaleString()} DA</strong> au compte indiqué,
          avec la référence : <code className="bg-amber-200/50 dark:bg-amber-900/50 px-1.5 py-0.5 rounded font-mono">BOOST-{listingId?.slice(-6).toUpperCase()}</code>.
          Notre équipe activera le boost sous 2h.
        </p>
      </div>
      <div className="flex gap-3">
        <Link to="/dashboard" className="px-6 py-3 bg-dz-green text-white font-black rounded-xl shadow-brand-md">
          Mon tableau de bord
        </Link>
        <Link to="/search" className="px-6 py-3 border border-border text-foreground font-bold rounded-xl hover:bg-muted">
          Voir les annonces
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 pb-20">

      {/* ── Hero ── */}
      <div className="hero-bg py-10 px-4 text-center mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-4">
            <Zap size={14} className="text-amber-400"/>
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Boostez votre visibilité</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-3">
            Vendez <span style={{color:'#D4AF37'}}>10× plus vite</span>
          </h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-md mx-auto">
            Les annonces boostées reçoivent en moyenne 7× plus de contacts.
            Atteignez des milliers d'acheteurs dès aujourd'hui.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* ── Step 1 — Choose plan ── */}
        <section>
          <h2 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-dz-green text-white rounded-full flex items-center justify-center text-sm font-black">1</span>
            Choisissez votre offre
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map(p => {
              const Icon = p.icon;
              const isSelected = selected === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className={`relative flex flex-col text-left p-5 rounded-2xl border-2 transition-all hover:shadow-card-hover ${
                    isSelected
                      ? 'border-dz-green bg-dz-green/5 shadow-brand-sm'
                      : 'border-border bg-card hover:border-dz-green/30'
                  }`}
                >
                  {/* Badge */}
                  {p.badge && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-dz-green text-white text-[9px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      {p.badge}
                    </span>
                  )}

                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-dz-green rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white"/>
                    </div>
                  )}

                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${p.bgColor}`}>
                    <Icon size={20} style={{ color: p.color }}/>
                  </div>

                  <p className="font-black text-foreground mb-0.5">{p.nameFr}</p>
                  <p className="text-2xl font-black mb-1" style={{ color: p.color }}>
                    {p.price.toLocaleString()} <span className="text-base font-bold">DA</span>
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">{p.duration} jours</p>

                  {/* Stats */}
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1 bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-xs font-black text-dz-green">{p.stats.visibility}</p>
                      <p className="text-[9px] text-muted-foreground">visibilité</p>
                    </div>
                    <div className="flex-1 bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-xs font-black text-blue-600">{p.stats.contacts}</p>
                      <p className="text-[9px] text-muted-foreground">contacts</p>
                    </div>
                  </div>

                  <ul className="space-y-1">
                    {p.features.slice(0, 3).map(f => (
                      <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <Check size={10} className="text-dz-green mt-0.5 shrink-0"/>
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Step 2 — Choose listing ── */}
        {myListings.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-dz-green text-white rounded-full flex items-center justify-center text-sm font-black">2</span>
              Quelle annonce booster ?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {myListings.slice(0, 6).map(l => (
                <button
                  key={l.id}
                  onClick={() => setListingId(l.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all ${
                    listingId === l.id
                      ? 'border-dz-green bg-dz-green/5'
                      : 'border-border bg-card hover:border-dz-green/30'
                  }`}
                >
                  <img src={l.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{l.title}</p>
                    <p className="text-xs text-dz-green font-bold">{l.price.toLocaleString()} DA</p>
                    <p className="text-xs text-muted-foreground">{l.views || 0} vues · {l.wilayaName}</p>
                  </div>
                  {listingId === l.id && <Check size={16} className="text-dz-green shrink-0"/>}
                </button>
              ))}
            </div>
            {myListings.length === 0 && (
              <div className="bg-card border border-border rounded-2xl p-6 text-center">
                <p className="text-muted-foreground text-sm mb-3">Aucune annonce active. Déposez d'abord une annonce.</p>
                <Link to="/post" className="px-4 py-2 bg-dz-green text-white font-bold text-sm rounded-xl">
                  Déposer une annonce
                </Link>
              </div>
            )}
          </section>
        )}

        {/* ── Step 3 — Payment ── */}
        <section>
          <h2 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-dz-green text-white rounded-full flex items-center justify-center text-sm font-black">3</span>
            Mode de paiement
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => m.available && setPayment(m.id)}
                disabled={!m.available}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  !m.available
                    ? 'border-border bg-muted/30 opacity-50 cursor-not-allowed'
                    : payment === m.id
                    ? 'border-dz-green bg-dz-green/5'
                    : 'border-border bg-card hover:border-dz-green/30'
                }`}
              >
                <span className="text-2xl">{m.icon}</span>
                <span className="text-xs font-bold text-center text-foreground leading-tight">{m.label}</span>
                {!m.available && <span className="text-[9px] text-muted-foreground">Bientôt</span>}
              </button>
            ))}
          </div>
        </section>

        {/* ── Summary + CTA ── */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-black text-foreground mb-4">Récapitulatif</h3>
          <div className="space-y-2 mb-6">
            {[
              ['Offre', plan.nameFr],
              ['Durée', `${plan.duration} jours`],
              ['Annonce', listing?.title || (myListings.length === 0 ? 'À déposer' : 'Non sélectionnée')],
              ['Paiement', PAYMENT_METHODS.find(m=>m.id===payment)?.label || ''],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-semibold text-foreground">{v}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-black text-foreground">Total</span>
              <span className="font-black text-2xl text-dz-green">{plan.price.toLocaleString()} DA</span>
            </div>
          </div>

          <button
            onClick={() => setStep('confirm')}
            disabled={!listingId && myListings.length > 0}
            className="w-full py-4 bg-dz-green hover:bg-dz-green2 text-white font-black text-lg rounded-2xl shadow-brand-lg transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Zap size={20}/> Commander le boost — {plan.price.toLocaleString()} DA
          </button>

          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Shield size={11}/> Paiement sécurisé</span>
            <span className="flex items-center gap-1"><Clock size={11}/> Activation sous 2h</span>
          </div>
        </div>

        {/* ── FAQ ── */}
        <section className="pb-10">
          <h2 className="text-xl font-black text-foreground mb-4">Questions fréquentes</h2>
          <div className="space-y-3">
            {[
              ['Comment fonctionne le boost ?', 'Votre annonce apparaît en tête des résultats de recherche et de la page d\'accueil pendant toute la durée de votre offre.'],
              ['Quand le boost est-il activé ?', 'Dès confirmation de votre paiement (généralement sous 2h en jours ouvrables). Vous recevrez un SMS de confirmation.'],
              ['Puis-je booster plusieurs annonces ?', 'Oui ! Avec le Pack Pro, boostez jusqu\'à 5 annonces simultanément. Sinon, chaque annonce a son propre boost.'],
              ['Remboursement si annonce vendue ?', 'Si votre annonce est vendue avant la fin du boost, nous créditerons votre compte de la durée restante.'],
            ].map(([q, a]) => (
              <details key={q} className="bg-card border border-border rounded-2xl group">
                <summary className="flex items-center justify-between p-4 cursor-pointer font-bold text-sm text-foreground">
                  {q}
                  <ChevronRight size={16} className="text-muted-foreground transition-transform group-open:rotate-90"/>
                </summary>
                <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BoostPage;
