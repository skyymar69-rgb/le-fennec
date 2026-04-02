import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { ALL_LISTINGS } from '../data/listings';
import type { Listing, MessageThread, Message, UserProfile } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────
function persist<T>(key: string, val: T) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}
function hydrate<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}

// ── Context type ──────────────────────────────────────────────────────────
interface AppCtx {
  user:        UserProfile | null;
  login:       (p: UserProfile) => void;
  logout:      () => void;
  listings:    Listing[];
  userListings: Listing[];
  addListing:  (l: Listing) => Promise<void>;
  favorites:   string[];
  toggleFav:   (id: string) => void;
  threads:     MessageThread[];
  sendMessage: (threadId: string, text: string) => void;
  startThread: (listingId: string, sellerId: string, firstMsg?: string) => string;
  markRead:    (threadId: string) => void;
  isLoading:   boolean;
}

const Ctx = createContext<AppCtx>({} as AppCtx);
export const useApp = () => useContext(Ctx);

// ── DB → Listing mapper ───────────────────────────────────────────────────
function dbToListing(row: any): Listing {
  return {
    id:          row.id,
    title:       row.title,
    slug:        row.title?.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
    description: row.description || '',
    price:       row.price || 0,
    currency:    row.currency || 'DZD',
    negotiable:  row.negotiable || false,
    categoryId:  row.category_id || '',
    category:    row.category || '',
    wilayaId:    row.wilaya_id || '',
    wilayaName:  row.wilaya_name || '',
    commune:     row.commune,
    condition:   row.condition || 'good',
    images:      row.images || [],
    imageUrl:    row.image_url || row.images?.[0] || '',
    attributes:  row.attributes || {},
    status:      row.status || 'active',
    views:       row.views || 0,
    isPremium:   row.is_premium || false,
    isUrgent:    row.is_urgent || false,
    isVerified:  row.is_verified || false,
    userId:      row.user_id || 'demo',
    phone:       row.phone,
    whatsapp:    row.whatsapp ?? true,
    date:        row.created_at ? new Date(row.created_at).toLocaleDateString('fr-DZ') : "Aujourd'hui",
    timestamp:   row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    location:    row.wilaya_name || '',
    ranking: {
      trustScore:   row.trust_score   || 50,
      qualityScore: row.quality_score || 50,
      clickRate:    0,
      boostLevel:   row.boost_level   || 0,
    },
  };
}

// ── Provider ──────────────────────────────────────────────────────────────
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,         setUser]         = useState<UserProfile | null>(() => hydrate('fennec_user', null));
  const [userListings, setUserListings] = useState<Listing[]>(() => hydrate('fennec_my_listings', []));
  const [dbListings,   setDbListings]   = useState<Listing[]>([]);
  const [favorites,    setFavorites]    = useState<string[]>(() => hydrate('fennec_favs', []));
  const [threads,      setThreads]      = useState<MessageThread[]>(() => hydrate('fennec_threads', []));
  const [isLoading,    setIsLoading]    = useState(false);
  const realtimeRef = useRef<any>(null);

  // All listings: Supabase DB first, then catalog, then user's local
  const listings = dbListings.length > 0
    ? [...dbListings, ...userListings.filter(l => !dbListings.find(d => d.id === l.id))]
    : [...ALL_LISTINGS, ...userListings];

  // ── Supabase auth listener ─────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) syncUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) await syncUser(session.user);
      else if (event === 'SIGNED_OUT') { setUser(null); persist('fennec_user', null); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function syncUser(su: any) {
    let p: UserProfile = {
      id:                 su.id,
      name:               su.user_metadata?.full_name || su.email?.split('@')[0] || 'Utilisateur',
      email:              su.email || '',
      phone:              su.phone || '',
      avatar:             su.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${su.email}&backgroundColor=006233&textColor=ffffff`,
      memberSince:        new Date(su.created_at).getFullYear().toString(),
      isEmailVerified:    !!su.email_confirmed_at,
      isPhoneVerified:    !!su.phone_confirmed_at,
      isIdentityVerified: false,
      trustScore:         20,
      badges:             [],
    };

    if (supabase) {
      const { data } = await supabase.from('profiles').select('*').eq('id', su.id).single();
      if (data) {
        p = { ...p,
          name:               data.name || p.name,
          phone:              data.phone || p.phone,
          avatar:             data.avatar || p.avatar,
          isEmailVerified:    data.is_email_verified ?? p.isEmailVerified,
          isPhoneVerified:    data.is_phone_verified  ?? p.isPhoneVerified,
          isIdentityVerified: data.is_identity_verified ?? false,
          trustScore:         data.trust_score ?? 20,
          badges:             data.badges ?? [],
        };
      }
    }

    setUser(p);
    persist('fennec_user', p);
    fetchUserData(su.id);
  }

  // ── Fetch user's listings + favorites from Supabase ───────────────────
  async function fetchUserData(userId: string) {
    if (!supabase) return;

    const [{ data: favs }, { data: myListings }] = await Promise.all([
      supabase.from('favorites').select('listing_id').eq('user_id', userId),
      supabase.from('listings').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);

    if (favs) {
      const ids = favs.map((f: any) => f.listing_id);
      setFavorites(ids);
      persist('fennec_favs', ids);
    }

    if (myListings) {
      const mapped = myListings.map(dbToListing);
      setUserListings(mapped);
      persist('fennec_my_listings', mapped);
    }
  }

  // ── Fetch public listings from Supabase ───────────────────────────────
  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) return;

    const load = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(500);
      if (!error && data && data.length > 0) {
        setDbListings(data.map(dbToListing));
      }
      setIsLoading(false);
    };

    load();

    // Realtime: new listings appear instantly
    const channel = supabase
      .channel('public_listings')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'listings',
        filter: 'status=eq.active',
      }, (payload: any) => {
        setDbListings(prev => [dbToListing(payload.new), ...prev]);
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'listings',
      }, (payload: any) => {
        setDbListings(prev => prev.map(l => l.id === payload.new.id ? dbToListing(payload.new) : l));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Realtime messages ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseEnabled || !supabase || !user) return;

    if (realtimeRef.current) supabase.removeChannel(realtimeRef.current);

    const channel = supabase
      .channel(`user_msgs_${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
      }, (payload: any) => {
        const row = payload.new;
        if (row.from_user === user.id) return;
        setThreads(prev => {
          const next = prev.map(t => {
            if (t.id !== row.thread_id) return t;
            const msg: Message = { id: row.id, from: row.from_user, text: row.text, ts: new Date(row.created_at).getTime(), read: false };
            return { ...t, messages: [...t.messages, msg], unread: t.unread + 1, lastTs: Date.now() };
          });
          persist('fennec_threads', next);
          return next;
        });
      })
      .subscribe();

    realtimeRef.current = channel;
    return () => { if (realtimeRef.current) supabase.removeChannel(realtimeRef.current); };
  }, [user?.id]);

  // ── Auth ───────────────────────────────────────────────────────────────
  const login = useCallback((p: UserProfile) => { setUser(p); persist('fennec_user', p); }, []);

  const logout = useCallback(async () => {
    if (isSupabaseEnabled && supabase) await supabase.auth.signOut();
    setUser(null);
    setDbListings([]);
    persist('fennec_user', null);
  }, []);

  // ── Listings ───────────────────────────────────────────────────────────
  const addListing = useCallback(async (l: Listing) => {
    // Optimistic local add
    setUserListings(prev => { const n = [l, ...prev]; persist('fennec_my_listings', n); return n; });

    if (isSupabaseEnabled && supabase && user) {
      const { data, error } = await supabase.from('listings').insert({
        title: l.title, description: l.description, price: l.price,
        currency: 'DZD', negotiable: l.negotiable,
        category_id: l.categoryId, category: l.category,
        wilaya_id: l.wilayaId, wilaya_name: l.wilayaName || '',
        commune: l.commune, condition: l.condition,
        images: l.images || [], image_url: l.imageUrl || l.images?.[0] || '',
        attributes: l.attributes || {}, user_id: user.id,
        status: l.status || 'active', phone: l.phone, whatsapp: l.whatsapp ?? true,
      }).select().single();

      if (!error && data) {
        const saved = dbToListing(data);
        setUserListings(prev => {
          const n = prev.map(x => x.id === l.id ? saved : x);
          persist('fennec_my_listings', n);
          return n;
        });
      } else if (error) {
        console.warn('Supabase listing insert error:', error.message);
      }
    }
  }, [user]);

  // ── Favorites ──────────────────────────────────────────────────────────
  const toggleFav = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      persist('fennec_favs', next);

      if (isSupabaseEnabled && supabase && user) {
        if (!prev.includes(id)) {
          supabase.from('favorites').insert({ user_id: user.id, listing_id: id }).then();
        } else {
          supabase.from('favorites').delete().eq('user_id', user.id).eq('listing_id', id).then();
        }
      }
      return next;
    });
  }, [user]);

  // ── Messaging ──────────────────────────────────────────────────────────
  const sendMessage = useCallback((threadId: string, text: string) => {
    const myId = user?.id || 'me';
    const msg: Message = { id: Date.now().toString(), from: myId, text, ts: Date.now(), read: false };

    setThreads(prev => {
      const next = prev.map(t => t.id !== threadId ? t : { ...t, messages: [...t.messages, msg], lastTs: Date.now(), unread: 0 });
      persist('fennec_threads', next);
      return next;
    });

    if (isSupabaseEnabled && supabase && user) {
      supabase.from('messages').insert({ thread_id: threadId, from_user: user.id, text, read: false, type: 'text' }).then();
    }

    // Auto-reply simulation (40% chance)
    if (Math.random() < 0.4) {
      setTimeout(() => {
        const replies = ["D'accord, je vous attends.", 'Parfait, à bientôt !', 'Oui bien sûr.', 'Entendu. Vous pouvez venir demain ?'];
        setThreads(prev => {
          const thread = prev.find(t => t.id === threadId);
          if (!thread) return prev;
          const auto: Message = { id: (Date.now()+1).toString(), from: thread.userId, text: replies[Math.floor(Math.random()*replies.length)], ts: Date.now(), read: false };
          const next = prev.map(t => t.id !== threadId ? t : { ...t, messages: [...t.messages, auto], unread: t.unread + 1, lastTs: Date.now() });
          persist('fennec_threads', next);
          return next;
        });
      }, 1500 + Math.random() * 3000);
    }
  }, [user]);

  const startThread = useCallback((listingId: string, sellerId: string, firstMsg?: string): string => {
    const existing = threads.find(t => t.listingId === listingId);
    if (existing) {
      if (firstMsg) sendMessage(existing.id, firstMsg);
      return existing.id;
    }

    const listing = listings.find(l => l.id === listingId);
    const thread: MessageThread = {
      id: `thread_${Date.now()}`, userId: sellerId,
      userName: 'Vendeur', userAvatar: '',
      listingId, listingTitle: listing?.title || '',
      listingImage: listing?.imageUrl, listingPrice: listing?.price,
      messages: firstMsg ? [{ id: Date.now().toString(), from: user?.id || 'me', text: firstMsg, ts: Date.now(), read: false }] : [],
      unread: 0, lastTs: Date.now(),
    };

    setThreads(prev => { const n = [thread, ...prev]; persist('fennec_threads', n); return n; });

    if (isSupabaseEnabled && supabase && user) {
      supabase.from('threads').insert({
        id: thread.id, listing_id: listingId, buyer_id: user.id, seller_id: sellerId || null,
        listing_title: listing?.title || '', listing_image: listing?.imageUrl, listing_price: listing?.price,
      }).then(({ error }) => {
        if (!error && firstMsg) {
          supabase.from('messages').insert({ thread_id: thread.id, from_user: user.id, text: firstMsg, read: false, type: 'text' }).then();
        }
      });
    }

    // Auto-reply
    if (firstMsg) {
      setTimeout(() => {
        const replies = ["Bonjour ! Oui, c'est toujours disponible.", 'Salut, venez voir quand vous voulez.', 'Bonjour ! Prix ferme, je suis disponible ce week-end.'];
        setThreads(prev => {
          const auto: Message = { id: (Date.now()+1).toString(), from: sellerId, text: replies[Math.floor(Math.random()*replies.length)], ts: Date.now(), read: false };
          const next = prev.map(t => t.id !== thread.id ? t : { ...t, messages: [...t.messages, auto], unread: 1, lastTs: Date.now() });
          persist('fennec_threads', next);
          return next;
        });
      }, 2500 + Math.random() * 2000);
    }

    return thread.id;
  }, [threads, user, listings, sendMessage]);

  const markRead = useCallback((threadId: string) => {
    setThreads(prev => { const n = prev.map(t => t.id === threadId ? { ...t, unread: 0 } : t); persist('fennec_threads', n); return n; });
  }, []);

  return (
    <Ctx.Provider value={{ user, login, logout, listings, userListings, addListing, favorites, toggleFav, threads, sendMessage, startThread, markRead, isLoading }}>
      {children}
    </Ctx.Provider>
  );
};
