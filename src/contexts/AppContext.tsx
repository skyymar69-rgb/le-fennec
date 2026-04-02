import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { ALL_LISTINGS } from '../data/listings';
import type { Listing, MessageThread, Message, UserProfile, SearchFilters } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────
function persist<T>(key: string, val: T) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}
function hydrate<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

// ── Context type ──────────────────────────────────────────────────────────
interface AppContextType {
  user:        UserProfile | null;
  login:       (profile: UserProfile) => void;
  logout:      () => void;
  listings:    Listing[];
  addListing:  (l: Listing) => void;
  favorites:   string[];
  toggleFav:   (id: string) => void;
  threads:     MessageThread[];
  sendMessage: (threadId: string, text: string) => void;
  startThread: (listingId: string, userId: string, firstMsg?: string) => string;
  markRead:    (threadId: string) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);
export const useApp = () => useContext(AppContext);

// ── Provider ──────────────────────────────────────────────────────────────
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,      setUser]      = useState<UserProfile | null>(() => hydrate('fennec_user', null));
  const [userListings, setUserListings] = useState<Listing[]>(() => hydrate('fennec_my_listings', []));
  const [favorites, setFavorites] = useState<string[]>(() => hydrate('fennec_favs', []));
  const [threads,   setThreads]   = useState<MessageThread[]>(() => hydrate('fennec_threads', []));

  // All listings = catalog + user's own
  const listings = [...ALL_LISTINGS, ...userListings];

  // ── Supabase Auth listener ─────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) return;

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUserFromSupabase(session.user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await syncUserFromSupabase(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        persist('fennec_user', null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function syncUserFromSupabase(supaUser: any) {
    let profile: UserProfile = {
      id:                 supaUser.id,
      name:               supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'Utilisateur',
      email:              supaUser.email || '',
      phone:              supaUser.phone || '',
      avatar:             supaUser.user_metadata?.avatar_url || '',
      memberSince:        new Date(supaUser.created_at).getFullYear().toString(),
      isEmailVerified:    supaUser.email_confirmed_at != null,
      isPhoneVerified:    supaUser.phone_confirmed_at != null,
      isIdentityVerified: false,
      trustScore:         20,
      badges:             [],
    };

    // Try to get extended profile from profiles table
    if (supabase) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supaUser.id)
        .single();
      if (data) {
        profile = {
          ...profile,
          name:               data.name || profile.name,
          phone:              data.phone || profile.phone,
          avatar:             data.avatar || profile.avatar,
          isEmailVerified:    data.is_email_verified ?? profile.isEmailVerified,
          isPhoneVerified:    data.is_phone_verified  ?? profile.isPhoneVerified,
          isIdentityVerified: data.is_identity_verified ?? false,
          trustScore:         data.trust_score ?? 20,
          badges:             data.badges ?? [],
        };
      }
    }

    setUser(profile);
    persist('fennec_user', profile);
  }

  // ── Login (local fallback) ─────────────────────────────────────────────
  const login = useCallback((profile: UserProfile) => {
    setUser(profile);
    persist('fennec_user', profile);
  }, []);

  const logout = useCallback(async () => {
    if (isSupabaseEnabled && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    persist('fennec_user', null);
  }, []);

  // ── Listings ───────────────────────────────────────────────────────────
  const addListing = useCallback((l: Listing) => {
    setUserListings(prev => {
      const next = [l, ...prev];
      persist('fennec_my_listings', next);
      return next;
    });

    // Persist to Supabase if enabled
    if (isSupabaseEnabled && supabase && user) {
      supabase.from('listings').insert({
        title:       l.title,
        description: l.description,
        price:       l.price,
        currency:    'DZD',
        negotiable:  l.negotiable,
        category_id: l.categoryId,
        category:    l.category,
        wilaya_id:   l.wilayaId,
        wilaya_name: l.wilayaName,
        commune:     l.commune,
        condition:   l.condition,
        images:      l.images || [],
        image_url:   l.imageUrl || l.images?.[0] || '',
        attributes:  l.attributes || {},
        user_id:     user.id,
        status:      l.status || 'pending',
        phone:       l.phone,
        whatsapp:    l.whatsapp ?? true,
      }).then(({ error }) => {
        if (error) console.warn('Supabase insert listing error:', error);
      });
    }
  }, [user]);

  // ── Favorites ──────────────────────────────────────────────────────────
  const toggleFav = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      persist('fennec_favs', next);
      return next;
    });
  }, []);

  // ── Messaging ──────────────────────────────────────────────────────────
  const sendMessage = useCallback((threadId: string, text: string) => {
    const myId = user?.id || 'me';
    setThreads(prev => {
      const msg: Message = {
        id: Date.now().toString(), from: myId,
        text, ts: Date.now(), read: false,
      };
      const next = prev.map(t => t.id !== threadId ? t : {
        ...t,
        messages: [...t.messages, msg],
        lastTs:   Date.now(),
        unread:   0,
      });
      persist('fennec_threads', next);
      return next;
    });

    // Persist to Supabase
    if (isSupabaseEnabled && supabase && user) {
      supabase.from('messages').insert({
        thread_id: threadId,
        from_user: user.id,
        text,
        read:      false,
        type:      'text',
      }).then(({ error }) => {
        if (error) console.warn('Message insert error:', error);
      });
    }

    // Auto-reply (40% chance)
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
            id:   (Date.now() + 1).toString(),
            from: thread.userId,
            text: replies[Math.floor(Math.random() * replies.length)],
            ts:   Date.now(), read: false,
          };
          const next = prev.map(t => t.id !== threadId ? t : {
            ...t,
            messages: [...t.messages, autoMsg],
            unread:   t.unread + 1,
            lastTs:   Date.now(),
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
        const msg: Message = {
          id: Date.now().toString(), from: user?.id || 'me',
          text: firstMsg, ts: Date.now(), read: false,
        };
        setThreads(prev => {
          const next = prev.map(t => t.id !== existing.id ? t : {
            ...t, messages: [...t.messages, msg], lastTs: Date.now(),
          });
          persist('fennec_threads', next);
          return next;
        });
        // Auto-reply
        setTimeout(() => {
          const replies = [
            "Bonjour ! Oui, c'est toujours disponible.",
            "Bonjour ! Vous pouvez me contacter au numéro indiqué.",
            'Salut, oui toujours dispo. Quand pouvez-vous passer ?',
            'Bonjour ! Le prix est ferme mais on peut discuter.',
          ];
          setThreads(prev => {
            const autoMsg: Message = {
              id: (Date.now()+1).toString(), from: userId,
              text: replies[Math.floor(Math.random()*replies.length)],
              ts: Date.now(), read: false,
            };
            const next = prev.map(t => t.id !== existing.id ? t : {
              ...t, messages: [...t.messages, autoMsg], unread: t.unread+1, lastTs: Date.now(),
            });
            persist('fennec_threads', next);
            return next;
          });
        }, 2000 + Math.random() * 2000);
      }
      return existing.id;
    }

    const listing = ALL_LISTINGS.find(l => l.id === listingId);
    const newThread: MessageThread = {
      id:           `thread_${Date.now()}`,
      userId, userName: 'Vendeur', userAvatar: '',
      listingId, listingTitle:  listing?.title   || '',
      listingPrice: listing?.price,
      listingImage: listing?.imageUrl,
      messages:     firstMsg ? [{
        id: Date.now().toString(), from: user?.id || 'me',
        text: firstMsg, ts: Date.now(), read: false,
      }] : [],
      unread: 0, lastTs: Date.now(),
    };

    setThreads(prev => {
      const next = [newThread, ...prev];
      persist('fennec_threads', next);
      return next;
    });

    if (firstMsg) {
      setTimeout(() => {
        const replies = [
          "Bonjour ! Oui, c'est toujours disponible.",
          'Salut, merci pour votre intérêt. Venez voir quand vous voulez.',
          "Bonjour ! Prix ferme. Je suis disponible ce week-end.",
        ];
        setThreads(prev => {
          const autoMsg: Message = {
            id: (Date.now()+1).toString(), from: userId,
            text: replies[Math.floor(Math.random()*replies.length)],
            ts: Date.now(), read: false,
          };
          const next = prev.map(t => t.id !== newThread.id ? t : {
            ...t, messages: [...t.messages, autoMsg], unread: 1, lastTs: Date.now(),
          });
          persist('fennec_threads', next);
          return next;
        });
      }, 2500 + Math.random() * 2000);
    }

    return newThread.id;
  }, [threads, user]);

  const markRead = useCallback((threadId: string) => {
    setThreads(prev => {
      const next = prev.map(t => t.id === threadId ? { ...t, unread: 0 } : t);
      persist('fennec_threads', next);
      return next;
    });
  }, []);

  // ── Supabase Realtime for messages ─────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseEnabled || !supabase || !user) return;

    const channel = supabase
      .channel('realtime_messages')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
      }, (payload: any) => {
        const row = payload.new;
        if (row.from_user === user.id) return; // Already added locally
        setThreads(prev => {
          const next = prev.map(t => {
            if (t.id !== row.thread_id) return t;
            const msg: Message = {
              id: row.id, from: row.from_user,
              text: row.text, ts: new Date(row.created_at).getTime(), read: false,
            };
            return { ...t, messages: [...t.messages, msg], unread: t.unread + 1, lastTs: Date.now() };
          });
          persist('fennec_threads', next);
          return next;
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <AppContext.Provider value={{
      user, login, logout,
      listings, addListing,
      favorites, toggleFav,
      threads, sendMessage, startThread, markRead,
    }}>
      {children}
    </AppContext.Provider>
  );
};
