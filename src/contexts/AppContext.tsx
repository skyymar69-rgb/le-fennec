import React, {
  createContext, useContext, useState, useEffect, useCallback, PropsWithChildren
} from 'react';
import { ALL_LISTINGS } from '../data/listings';
import type {
  UserProfile, Listing, ListingStatus, MessageThread, Message, SearchFilters
} from '../types';

// ─── Persist helpers (localStorage) ──────────────────────────

function persist(key: string, val: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

function hydrate<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

// ─── Initial user ──────────────────────────────────────────────

// Auth is handled by AuthPage — no default user

// ─── Mock listings (demo data, starts empty in production) ────

const NOW = Date.now();
const DAY = 86_400_000;

// Catalog: see src/data/listings.ts
 [
  {
    id:'1', title:'Appartement F4 Haut Standing — Hydra, Alger',
    slug:'appartement-f4-hydra-1', price:45_000_000, currency:'DZD', negotiable:false,
    location:'Alger, Hydra', wilayaId:'16', wilayaName:'Alger', commune:'Hydra',
    imageUrl:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    images:[
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    ],
    category:'Immobilier', categoryId:'1', subCategory:'Appartements',
    isVerified:true, isPremium:true, condition:'new',
    date:'Hier', timestamp:NOW-DAY, views:1240, contacts:28, favorites:45,
    description:'Superbe appartement F4 en haut standing, lumineux, vue panoramique. Gardien 24h/24, parking, ascenseur. Proche métro et commerces.',
    attributes:{ surface:120, rooms:'4', floor:'5ème', parking:true },
    ranking:{ trustScore:95, qualityScore:90, clickRate:0.05, boostLevel:1 },
    status:'active', userId:'demo',
  },
  {
    id:'2', title:'Volkswagen Golf 8 R-Line 2024',
    slug:'vw-golf-8-rline-2024-2', price:7_500_000, currency:'DZD', negotiable:true,
    location:'Oran', wilayaId:'31', wilayaName:'Oran',
    imageUrl:'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80',
    images:[
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80',
      'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&q=80',
    ],
    category:'Véhicules', categoryId:'2', subCategory:'Voitures',
    isUrgent:true, isVerified:true, condition:'like_new',
    date:"Aujourd'hui", timestamp:NOW-DAY/4, views:3500, contacts:87, favorites:120,
    description:'Golf 8 R-Line parfait état. Toutes options, carnet complet, premier propriétaire.',
    attributes:{ year:2024, fuel:'Diesel', gearbox:'Automatique', mileage:12000 },
    ranking:{ trustScore:88, qualityScore:95, clickRate:0.12, boostLevel:2 },
    status:'active', userId:'demo',
  },
  {
    id:'3', title:'MacBook Pro M3 Max 16" — 36Go / 1To',
    slug:'macbook-pro-m3-max-3', price:650_000, currency:'DZD', negotiable:false,
    location:'Sétif', wilayaId:'19', wilayaName:'Sétif',
    imageUrl:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    images:['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80'],
    category:'High-Tech', categoryId:'3',
    condition:'like_new', date:'Il y a 2h', timestamp:NOW-DAY/12, views:89,
    description:'MacBook Pro M3 Max comme neuf, 3 mois. Facture Apple disponible.',
    attributes:{ brand:'Apple', storage:'1To', ram:'36Go' },
    ranking:{ trustScore:60, qualityScore:70, clickRate:0.02, boostLevel:0 },
    status:'active', userId:'demo',
  },
  {
    id:'4', title:'Villa avec piscine — Bord de mer, Tipaza',
    slug:'villa-piscine-tipaza-4', price:85_000_000, currency:'DZD', negotiable:true,
    location:'Tipaza', wilayaId:'42', wilayaName:'Tipaza',
    imageUrl:'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    images:[
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    ],
    category:'Immobilier', categoryId:'1', subCategory:'Villas',
    isVerified:true, condition:'new',
    date:'Il y a 3j', timestamp:NOW-DAY*3, views:400, favorites:67,
    description:'Villa de standing 450m² avec piscine. 5 chambres, vue mer, jardin paysager.',
    attributes:{ surface:450, rooms:'5+', pool:true },
    ranking:{ trustScore:98, qualityScore:85, clickRate:0.03, boostLevel:0 },
    status:'active', userId:'demo',
  },
  {
    id:'5', title:'iPhone 15 Pro Max 256Go Titane Naturel',
    slug:'iphone-15-promax-5', price:180_000, currency:'DZD', negotiable:false,
    location:'Alger', wilayaId:'16', wilayaName:'Alger',
    imageUrl:'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
    images:['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80'],
    category:'High-Tech', categoryId:'3', condition:'like_new',
    date:"Aujourd'hui", timestamp:NOW-DAY/2, views:512,
    description:'iPhone 15 Pro Max 256Go. Acheté il y a 4 mois. Garantie Apple valide.',
    attributes:{ brand:'Apple', storage:'256Go' },
    ranking:{ trustScore:20, qualityScore:30, clickRate:0.01, boostLevel:0 },
    status:'active', userId:'demo',
  },
  {
    id:'6', title:'Renault Clio 5 RS Line 2023',
    slug:'clio-5-rsline-6', price:3_200_000, currency:'DZD', negotiable:true,
    location:'Blida', wilayaId:'09', wilayaName:'Blida',
    imageUrl:'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
    images:['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80'],
    category:'Véhicules', categoryId:'2', condition:'like_new',
    date:'Il y a 1j', timestamp:NOW-DAY, views:1800,
    description:'Clio 5 RS Line, état impeccable. CT valide, carnet à jour.',
    attributes:{ year:2023, fuel:'Essence', gearbox:'Automatique', mileage:28000 },
    ranking:{ trustScore:75, qualityScore:70, clickRate:0.04, boostLevel:0 },
    status:'active', userId:'demo',
  },
];

// ─── Context ──────────────────────────────────────────────────

interface AppState {
  user:     UserProfile | null;
  login:    (u: UserProfile) => void;
  logout:   () => void;
  updateUser: (updates: Partial<UserProfile>) => void;

  listings:            Listing[];
  addListing:          (l: Listing) => void;
  updateListingStatus: (id: string, status: ListingStatus) => void;
  removeListing:       (id: string) => void;

  favorites: string[];
  toggleFav: (id: string) => void;

  threads:     MessageThread[];
  sendMessage: (threadId: string, text: string) => void;
  startThread: (listingId: string, userId: string, firstMsg?: string) => string;
  markRead:    (threadId: string) => void;

  filters:      SearchFilters;
  setFilters:   (f: Partial<SearchFilters>) => void;
  resetFilters: () => void;
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider = ({ children }: PropsWithChildren) => {
  // Hydrate synchronously from localStorage (no async blocking)
  const [user]      = useState<UserProfile | null>(() => hydrate('fennec_user', null));
  const [userState, setUser] = useState<UserProfile | null>(user);
  const [listings,  setListings]  = useState<Listing[]>(() => {
    // Always use ALL_LISTINGS as the base catalog
    return ALL_LISTINGS;
  });
  const [favorites, setFavorites] = useState<string[]>(() => hydrate('fennec_favorites', []));
  const [threads,   setThreads]   = useState<MessageThread[]>(() => hydrate('fennec_threads', []));
  const [filters,   setFiltersState] = useState<SearchFilters>({});

  const login = useCallback((u: UserProfile) => {
    setUser(u);
    persist('fennec_user', u);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    persist('fennec_user', null);
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
    const myId = user?.id || 'me';
    setThreads(prev => {
      const msg: Message = { id: Date.now().toString(), from: myId, text, ts: Date.now(), read: false };
      const next = prev.map(t => t.id !== threadId ? t : {
        ...t, unread: 0, lastTs: Date.now(), messages: [...t.messages, msg],
      });
      persist('fennec_threads', next);
      return next;
    });
    // 40% chance of auto-reply from seller
    if (Math.random() < 0.4) {
      setTimeout(() => {
        const replies = [
          "D'accord, je vous attends.",
          'Parfait, à bientôt !',
          'Oui bien sûr, pas de problème.',
          'Entendu. Vous pouvez venir demain ?',
          'Ok, le prix est négociable pour vous.',
        ];
        setThreads(prev => {
          const thread = prev.find(t => t.id === threadId);
          if (!thread) return prev;
          const autoMsg: Message = {
            id: (Date.now() + 1).toString(), from: thread.userId,
            text: replies[Math.floor(Math.random() * replies.length)],
            ts: Date.now(), read: false, type: 'text',
          };
          const next = prev.map(t => t.id !== threadId ? t : {
            ...t, messages: [...t.messages, autoMsg], unread: t.unread + 1, lastTs: Date.now(),
          });
          persist('fennec_threads', next);
          return next;
        });
      }, 1500 + Math.random() * 3000);
    }
  }, [user]);

  const startThread = useCallback((
    listingId: string, userId: string, firstMsg?: string
  ): string => {
    const existing = threads.find(th => th.listingId === listingId);
    if (existing) {
      if (firstMsg) {
        const msg: Message = { id: Date.now().toString(), from: user?.id || 'me', text: firstMsg, ts: Date.now(), read: false };
        setThreads(prev => {
          const next = prev.map(t => t.id !== existing.id ? t : {
            ...t, messages: [...t.messages, msg], lastTs: Date.now(),
          });
          persist('fennec_threads', next);
          return next;
        });
        // Simulate seller reply after 2-4s
        setTimeout(() => {
          const replies = [
            "Bonjour ! Oui, c'est toujours disponible.",
            "Bonjour ! Vous pouvez me contacter au numéro indiqué.",
            "Salut, oui toujours dispo. Quand pouvez-vous passer ?",
            "Bonjour ! Le prix est ferme mais on peut discuter.",
          ];
          const autoReply: Message = {
            id: (Date.now() + 1).toString(),
            from: userId, 
            text: replies[Math.floor(Math.random() * replies.length)],
            ts: Date.now(), read: false, type: 'text',
          };
          setThreads(prev => {
            const next = prev.map(t => t.id !== existing.id ? t : {
              ...t, messages: [...t.messages, autoReply], unread: t.unread + 1, lastTs: Date.now(),
            });
            persist('fennec_threads', next);
            return next;
          });
        }, 2000 + Math.random() * 2000);
      }
      return existing.id;
    }

    const listing = ALL_LISTINGS.find(l => l.id === listingId);
    const newT: MessageThread = {
      id: `thread_${Date.now()}`,
      userId, userName: 'Vendeur', userAvatar: '',
      listingId, listingTitle: listing?.title || '',
      listingPrice: listing?.price, listingImage: listing?.imageUrl,
      messages: firstMsg ? [{
        id: Date.now().toString(), from: user?.id || 'me',
        text: firstMsg, ts: Date.now(), read: false,
      }] : [],
      unread: 0, lastTs: Date.now(),
    };
    setThreads(prev => {
      const next = [newT, ...prev];
      persist('fennec_threads', next);
      return next;
    });
    // Auto reply
    if (firstMsg) {
      setTimeout(() => {
        const replies = [
          "Bonjour ! Oui, c'est toujours disponible.",
          "Salut, merci pour votre intérêt. Venez voir quand vous voulez.",
          "Bonjour ! Prix ferme. Je suis disponible ce week-end.",
        ];
        const autoReply: Message = {
          id: (Date.now() + 1).toString(), from: userId,
          text: replies[Math.floor(Math.random() * replies.length)],
          ts: Date.now(), read: false, type: 'text',
        };
        setThreads(prev => {
          const next = prev.map(t => t.id !== newT.id ? t : {
            ...t, messages: [...t.messages, autoReply], unread: 1, lastTs: Date.now(),
          });
          persist('fennec_threads', next);
          return next;
        });
      }, 2500 + Math.random() * 2000);
    }
    return newT.id;
  }, [threads, user]);

  const markRead = useCallback((threadId: string) => {
    setThreads(prev => {
      const next = prev.map(t => t.id === threadId ? { ...t, unread: 0 } : t);
      persist('fennec_threads', next);
      return next;
    });
  }, []);

  const setFilters   = useCallback((f: Partial<SearchFilters>) => setFiltersState(p => ({ ...p, ...f })), []);
  const resetFilters = useCallback(() => setFiltersState({}), []);

  return (
    <AppContext.Provider value={{
      user: userState, login, logout, updateUser,
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
