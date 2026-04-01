import React, {
  createContext, useContext, useState, useEffect, useCallback, PropsWithChildren
} from 'react';
import type {
  UserProfile, Listing, ListingStatus, MessageThread, Message, SearchFilters
} from '../types';

// ─── Mock data ───────────────────────────────────────────────────────────────

const NOW = Date.now();
const DAY = 86_400_000;

export const INITIAL_USER: UserProfile = {
  id: 'u1', name: 'Karim H.', email: 'karim@gmail.com',
  phone: '0550 12 34 56', avatar: 'https://picsum.photos/100/100?random=99',
  memberSince: '2023', isEmailVerified: true, isPhoneVerified: false,
  isIdentityVerified: false, trustScore: 20, badges: [],
};

export const MOCK_LISTINGS: Listing[] = [
  {
    id:'1', title:'Appartement F4 Haut Standing — Hydra, Alger', slug:'appartement-f4-hydra-alger-1',
    price:45_000_000, currency:'DZD', negotiable:false,
    location:'Alger, Hydra', wilayaId:'16', wilayaName:'Alger', commune:'Hydra',
    imageUrl:'https://picsum.photos/800/600?random=1',
    images:['https://picsum.photos/800/600?random=1','https://picsum.photos/800/600?random=11','https://picsum.photos/800/600?random=21','https://picsum.photos/800/600?random=31'],
    category:'Immobilier', categoryId:'1', subCategory:'Appartements',
    isVerified:true, isPremium:true, condition:'new',
    date:'Hier', timestamp:NOW-DAY, views:1240, contacts:28, favorites:45,
    description:'Superbe appartement F4 en haut standing, lumineux et spacieux. Vue panoramique sur Alger. Gardien 24h/24, parking sécurisé, ascenseur récent. Proche toutes commodités — métro, commerces, écoles.',
    attributes:{ surface:120, rooms:'4', floor:'5ème', orientation:'Nord/Est', parking:true },
    ranking:{ trustScore:95, qualityScore:90, clickRate:0.05, boostLevel:1 },
    status:'active', userId:'u2',
  },
  {
    id:'2', title:'Volkswagen Golf 8 R-Line 2024 — Automatique', slug:'vw-golf-8-rline-2024-oran-2',
    price:7_500_000, currency:'DZD', negotiable:true,
    location:'Oran, Centre', wilayaId:'31', wilayaName:'Oran',
    imageUrl:'https://picsum.photos/800/600?random=2',
    images:['https://picsum.photos/800/600?random=2','https://picsum.photos/800/600?random=12','https://picsum.photos/800/600?random=22','https://picsum.photos/800/600?random=32','https://picsum.photos/800/600?random=42'],
    category:'Véhicules', categoryId:'2', subCategory:'Voitures',
    isUrgent:true, isVerified:true, condition:'like_new',
    date:"Aujourd'hui", timestamp:NOW-DAY/4, views:3500, contacts:87, favorites:120,
    description:'Golf 8 R-Line en parfait état. Entretien suivi chez concessionnaire officiel. Toutes options : toit ouvrant panoramique, écran tactile 10", caméra 360°, régulateur adaptatif ACC. Carnet complet, premier propriétaire.',
    attributes:{ year:2024, fuel:'Diesel', gearbox:'Automatique', mileage:12000, color:'Blanc', power:'150ch' },
    ranking:{ trustScore:88, qualityScore:95, clickRate:0.12, boostLevel:2 },
    status:'active', userId:'u2',
  },
  {
    id:'3', title:'MacBook Pro M3 Max 16" — 36Go RAM / 1To SSD', slug:'macbook-pro-m3-max-setif-3',
    price:650_000, currency:'DZD', negotiable:false,
    location:'Sétif', wilayaId:'19', wilayaName:'Sétif',
    imageUrl:'https://picsum.photos/800/600?random=3',
    images:['https://picsum.photos/800/600?random=3','https://picsum.photos/800/600?random=13'],
    category:'High-Tech', categoryId:'3',
    condition:'like_new', date:'Il y a 2h', timestamp:NOW-DAY/12, views:89, contacts:5,
    description:'MacBook Pro 16" M3 Max, 36Go RAM, 1To SSD. Comme neuf, utilisé 3 mois. Facture et garantie Apple disponibles. Boîte et tous les accessoires originaux.',
    attributes:{ brand:'Apple', model:'MacBook Pro 16"', storage:'1To', ram:'36Go', state:'Comme neuf' },
    ranking:{ trustScore:60, qualityScore:70, clickRate:0.02, boostLevel:0 },
    status:'active', userId:'u3',
  },
  {
    id:'4', title:'Villa avec piscine — Bord de mer, Tipaza', slug:'villa-piscine-tipaza-4',
    price:85_000_000, currency:'DZD', negotiable:true,
    location:'Tipaza', wilayaId:'42', wilayaName:'Tipaza',
    imageUrl:'https://picsum.photos/800/600?random=4',
    images:['https://picsum.photos/800/600?random=4','https://picsum.photos/800/600?random=14','https://picsum.photos/800/600?random=24','https://picsum.photos/800/600?random=34'],
    category:'Immobilier', categoryId:'1', subCategory:'Villas',
    isVerified:true, condition:'new',
    date:'Il y a 3 jours', timestamp:NOW-DAY*3, views:400, contacts:12, favorites:67,
    description:'Villa de standing sur 650m² avec piscine. 5 chambres, 3 salons, cuisine entièrement équipée. Jardin paysager avec éclairage automatique. Vue mer imprenable depuis toutes les terrasses.',
    attributes:{ surface:450, rooms:'5+', pool:true, garden:true, floors:2 },
    ranking:{ trustScore:98, qualityScore:85, clickRate:0.03, boostLevel:0 },
    status:'active', userId:'u3',
  },
  {
    id:'5', title:'Renault Clio 4 GT Line — Très bon état', slug:'renault-clio-4-gtline-blida-5',
    price:2_800_000, currency:'DZD', negotiable:true,
    location:'Blida', wilayaId:'09', wilayaName:'Blida',
    imageUrl:'https://picsum.photos/800/600?random=5',
    images:['https://picsum.photos/800/600?random=5','https://picsum.photos/800/600?random=15','https://picsum.photos/800/600?random=25'],
    category:'Véhicules', categoryId:'2', condition:'good',
    date:'Hier', timestamp:NOW-DAY*1.5, views:2100, contacts:43,
    description:'Clio 4 GT Line état impeccable. CT valide 2025. Carnet entretien à jour. Pneus neufs 2024. Pas de carrosserie. Idéale premier véhicule.',
    attributes:{ year:2018, fuel:'Diesel', gearbox:'Manuelle', mileage:145000, color:'Rouge', power:'90ch' },
    ranking:{ trustScore:75, qualityScore:60, clickRate:0.04, boostLevel:0 },
    status:'active', userId:'u1',
  },
  {
    id:'6', title:'iPhone 15 Pro Max 256Go — Titane Naturel', slug:'iphone-15-promax-alger-6',
    price:180_000, currency:'DZD', negotiable:false,
    location:'Alger', wilayaId:'16', wilayaName:'Alger',
    imageUrl:'https://picsum.photos/800/600?random=6',
    images:['https://picsum.photos/800/600?random=6','https://picsum.photos/800/600?random=16','https://picsum.photos/800/600?random=26'],
    category:'High-Tech', categoryId:'3', condition:'like_new',
    date:"Aujourd'hui", timestamp:NOW-DAY/2, views:512, contacts:18,
    description:'iPhone 15 Pro Max 256Go Titane Naturel. Acheté il y a 4 mois. Boîte et accessoires originaux. Garantie Apple 8 mois restants. Toujours utilisé avec coque et verre trempé.',
    attributes:{ brand:'Apple', model:'iPhone 15 Pro Max', storage:'256Go', color:'Titane Naturel' },
    ranking:{ trustScore:20, qualityScore:30, clickRate:0.01, boostLevel:0 },
    status:'active', userId:'u1',
  },
  {
    id:'7', title:'Toyota Hilux Double Cab 4x4 2021', slug:'toyota-hilux-4x4-constantine-7',
    price:9_800_000, currency:'DZD', negotiable:true,
    location:'Constantine', wilayaId:'25', wilayaName:'Constantine',
    imageUrl:'https://picsum.photos/800/600?random=7',
    images:['https://picsum.photos/800/600?random=7','https://picsum.photos/800/600?random=17','https://picsum.photos/800/600?random=27'],
    category:'Véhicules', categoryId:'2', isVerified:true, condition:'good',
    date:'Il y a 5 jours', timestamp:NOW-DAY*5, views:1800, contacts:34, favorites:56,
    description:'Hilux 4x4 en excellent état. Moteur diesel 2.8L 204cv. Treuil, barre de protection, tendeau benne. Idéal professionnels et particuliers.',
    attributes:{ year:2021, fuel:'Diesel', gearbox:'Automatique', mileage:65000, color:'Blanc', power:'204ch' },
    ranking:{ trustScore:92, qualityScore:88, clickRate:0.07, boostLevel:1 },
    status:'active', userId:'u2',
  },
  {
    id:'8', title:'Terrain agricole irrigué — 5 hectares, Mascara', slug:'terrain-agricole-mascara-8',
    price:12_000_000, currency:'DZD', negotiable:true,
    location:'Mascara', wilayaId:'29', wilayaName:'Mascara',
    imageUrl:'https://picsum.photos/800/600?random=8',
    images:['https://picsum.photos/800/600?random=8'],
    category:'Agriculture', categoryId:'7',
    date:'Il y a 1 semaine', timestamp:NOW-DAY*7, views:330, contacts:8,
    description:'Terrain agricole irrigué, 5 hectares, acte notarié. Eau en abondance, puits artésien. Accès piste carrossable toute l\'année.',
    attributes:{ surface:50000, type:'Terrain', water:true, act:'Notarié' },
    ranking:{ trustScore:80, qualityScore:75, clickRate:0.02, boostLevel:0 },
    status:'active', userId:'u3',
  },
];

export const MOCK_THREADS: MessageThread[] = [
  {
    id:'t1', userId:'u2', userName:'Amine T.', userAvatar:'https://picsum.photos/60/60?random=11',
    listingId:'5', listingTitle:'Renault Clio 4 GT Line', listingPrice:2_800_000,
    listingImage:'https://picsum.photos/60/60?random=5',
    messages:[
      { id:'m1', from:'u2', text:'Bonjour, est-ce que le prix est négociable ?', ts:NOW-3600000 },
      { id:'m2', from:'u1', text:'Oui légèrement, on peut discuter en direct.', ts:NOW-3000000 },
      { id:'m3', from:'u2', text:'Parfait ! Je suis disponible demain matin.', ts:NOW-1800000 },
    ], unread:1, lastTs:NOW-1800000,
  },
  {
    id:'t2', userId:'u3', userName:'Sarah L.', userAvatar:'https://picsum.photos/60/60?random=12',
    listingId:'6', listingTitle:'iPhone 15 Pro Max 256Go', listingPrice:180_000,
    listingImage:'https://picsum.photos/60/60?random=6',
    messages:[
      { id:'m4', from:'u3', text:'Toujours disponible ?', ts:NOW-86400000 },
      { id:'m5', from:'u1', text:'Oui toujours !', ts:NOW-80000000 },
    ], unread:0, lastTs:NOW-80000000,
  },
];

// ─── Persist helper ───────────────────────────────────────────────────────────

async function persist(key: string, val: unknown) {
  try { await (window as any).storage?.set(key, JSON.stringify(val)); } catch {}
}
async function hydrate<T>(key: string, fallback: T): Promise<T> {
  try {
    const r = await (window as any).storage?.get(key);
    return r ? JSON.parse(r.value) as T : fallback;
  } catch { return fallback; }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppState {
  user: UserProfile | null;
  login:  (u: UserProfile) => void;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;

  listings: Listing[];
  addListing:           (l: Listing) => void;
  updateListingStatus:  (id: string, status: ListingStatus) => void;
  removeListing:        (id: string) => void;

  favorites: string[];
  toggleFav: (id: string) => void;

  threads: MessageThread[];
  sendMessage:  (threadId: string, text: string) => void;
  startThread:  (t: Omit<MessageThread, 'messages' | 'unread'>) => string;
  markRead:     (threadId: string) => void;

  filters:    SearchFilters;
  setFilters: (f: Partial<SearchFilters>) => void;
  resetFilters: () => void;
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [user,      setUser]      = useState<UserProfile | null>(null);
  const [listings,  setListings]  = useState<Listing[]>(MOCK_LISTINGS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [threads,   setThreads]   = useState<MessageThread[]>(MOCK_THREADS);
  const [filters,   setFiltersState] = useState<SearchFilters>({});
  const [ready,     setReady]     = useState(false);

  useEffect(() => {
    Promise.all([
      hydrate<UserProfile | null>('fennec_user', null),
      hydrate<Listing[]>('fennec_listings', MOCK_LISTINGS),
      hydrate<string[]>('fennec_favorites', []),
      hydrate<MessageThread[]>('fennec_threads', MOCK_THREADS),
    ]).then(([u, ls, fav, thr]) => {
      if (u)   setUser(u);
      if (ls?.length)  setListings(ls);
      if (fav?.length) setFavorites(fav);
      if (thr?.length) setThreads(thr);
      setReady(true);
    });
  }, []);

  const login = useCallback((u: UserProfile) => {
    setUser(u); persist('fennec_user', u);
  }, []);
  const logout = useCallback(() => {
    setUser(null); persist('fennec_user', null);
  }, []);
  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      persist('fennec_user', next);
      return next;
    });
  }, []);

  const addListing = useCallback((l: Listing) => {
    setListings(prev => {
      const next = [l, ...prev];
      persist('fennec_listings', next);
      return next;
    });
  }, []);
  const updateListingStatus = useCallback((id: string, status: ListingStatus) => {
    setListings(prev => {
      const next = prev.map(l => l.id === id ? { ...l, status } : l);
      persist('fennec_listings', next);
      return next;
    });
  }, []);
  const removeListing = useCallback((id: string) => {
    setListings(prev => {
      const next = prev.filter(l => l.id !== id);
      persist('fennec_listings', next);
      return next;
    });
  }, []);

  const toggleFav = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      persist('fennec_favorites', next);
      return next;
    });
  }, []);

  const sendMessage = useCallback((threadId: string, text: string) => {
    setThreads(prev => {
      const next = prev.map(t => {
        if (t.id !== threadId) return t;
        const msg: Message = { id: Date.now().toString(), from: 'u1', text, ts: Date.now() };
        return { ...t, unread: 0, lastTs: Date.now(), messages: [...t.messages, msg] };
      });
      persist('fennec_threads', next);
      return next;
    });
  }, []);

  const startThread = useCallback((t: Omit<MessageThread, 'messages' | 'unread'>): string => {
    const existing = threads.find(th => th.listingId === t.listingId && th.userId === t.userId);
    if (existing) return existing.id;
    const newT: MessageThread = { ...t, messages: [], unread: 0, lastTs: Date.now() };
    setThreads(prev => {
      const next = [newT, ...prev];
      persist('fennec_threads', next);
      return next;
    });
    return newT.id;
  }, [threads]);

  const markRead = useCallback((threadId: string) => {
    setThreads(prev => {
      const next = prev.map(t => t.id === threadId ? { ...t, unread: 0 } : t);
      persist('fennec_threads', next);
      return next;
    });
  }, []);

  const setFilters = useCallback((f: Partial<SearchFilters>) => {
    setFiltersState(prev => ({ ...prev, ...f }));
  }, []);
  const resetFilters = useCallback(() => setFiltersState({}), []);

  if (!ready) return null;

  return (
    <AppContext.Provider value={{
      user, login, logout, updateUser,
      listings, addListing, updateListingStatus, removeListing,
      favorites, toggleFav,
      threads, sendMessage, startThread, markRead,
      filters, setFilters, resetFilters,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppState => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
