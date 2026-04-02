/**
 * API Layer — Le Fennec DZ Market
 * Falls back to localStorage when Supabase is not configured.
 * Replace implementations with Supabase calls once env vars are set.
 */
import { supabase, isSupabaseEnabled, DbListing, DbMessage, DbThread } from './supabase';
import type { Listing, MessageThread, Message, UserProfile } from '../types';
import { ALL_LISTINGS } from '../data/listings';

// ── Listings ──────────────────────────────────────────────────────────────

export async function fetchListings(filters?: {
  category?: string; wilaya?: string; q?: string;
  limit?: number; offset?: number;
}): Promise<Listing[]> {
  if (isSupabaseEnabled && supabase) {
    let query = supabase.from('listings').select('*').eq('status', 'active');
    if (filters?.category) query = query.eq('category_id', filters.category);
    if (filters?.wilaya)   query = query.eq('wilaya_id', filters.wilaya);
    if (filters?.q)        query = query.ilike('title', `%${filters.q}%`);
    if (filters?.limit)    query = query.limit(filters.limit);
    if (filters?.offset)   query = query.range(filters.offset, (filters.offset || 0) + (filters.limit || 24) - 1);
    query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (!error && data) return data.map(dbToListing);
  }
  // Fallback: local data
  return ALL_LISTINGS;
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase
      .from('listings').select('*').eq('id', id).single();
    if (!error && data) {
      // Increment views
      supabase.from('listings').update({ views: (data.views || 0) + 1 }).eq('id', id);
      return dbToListing(data);
    }
  }
  return ALL_LISTINGS.find(l => l.id === id) || null;
}

export async function createListing(listing: Partial<Listing>, userId: string): Promise<Listing | null> {
  if (isSupabaseEnabled && supabase) {
    const row: Partial<DbListing> = {
      title:       listing.title,
      description: listing.description,
      price:       listing.price,
      currency:    'DZD',
      negotiable:  listing.negotiable,
      category_id: listing.categoryId,
      category:    listing.category,
      wilaya_id:   listing.wilayaId,
      wilaya_name: listing.wilayaName,
      commune:     listing.commune,
      condition:   listing.condition,
      images:      listing.images || [],
      image_url:   listing.imageUrl || listing.images?.[0] || '',
      attributes:  listing.attributes as any || {},
      user_id:     userId,
      status:      'pending', // Goes through moderation
      views:       0,
      is_premium:  false,
      is_urgent:   false,
      is_verified: false,
      boost_level: 0,
    };
    const { data, error } = await supabase.from('listings').insert(row).select().single();
    if (!error && data) return dbToListing(data);
  }
  return null;
}

function dbToListing(row: DbListing): Listing {
  return {
    id:          row.id,
    title:       row.title,
    slug:        row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: row.description,
    price:       row.price,
    currency:    row.currency || 'DZD',
    negotiable:  row.negotiable,
    categoryId:  row.category_id,
    category:    row.category,
    wilayaId:    row.wilaya_id,
    wilayaName:  row.wilaya_name,
    commune:     row.commune,
    condition:   row.condition as any,
    images:      row.images || [],
    imageUrl:    row.image_url || row.images?.[0] || '',
    attributes:  row.attributes || {},
    status:      row.status as any,
    views:       row.views || 0,
    isPremium:   row.is_premium,
    isUrgent:    row.is_urgent,
    isVerified:  row.is_verified,
    userId:      row.user_id,
    phone:       row.phone,
    whatsapp:    row.whatsapp,
    date:        new Date(row.created_at).toLocaleDateString('fr-DZ'),
    timestamp:   new Date(row.created_at).getTime(),
    location:    row.wilaya_name,
    ranking: {
      trustScore:   row.trust_score  || 50,
      qualityScore: row.quality_score || 50,
      clickRate:    0,
      boostLevel:   row.boost_level   || 0,
    },
  };
}

// ── Messages / Threads ────────────────────────────────────────────────────

export async function fetchThreads(userId: string): Promise<MessageThread[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase
    .from('threads')
    .select('*, messages(*)')
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('last_ts', { ascending: false });
  if (error || !data) return [];
  return data.map(t => dbToThread(t, userId));
}

export async function sendMessageToThread(
  threadId: string, fromUser: string, text: string
): Promise<Message | null> {
  if (!isSupabaseEnabled || !supabase) return null;
  const { data, error } = await supabase
    .from('messages')
    .insert({ thread_id: threadId, from_user: fromUser, text, read: false, type: 'text' })
    .select().single();
  // Update thread last_message
  await supabase.from('threads')
    .update({ last_message: text, last_ts: new Date().toISOString() })
    .eq('id', threadId);
  if (error || !data) return null;
  return { id: data.id, from: data.from_user, text: data.text, ts: new Date(data.created_at).getTime() };
}

function dbToThread(row: any, myId: string): MessageThread {
  const msgs: Message[] = (row.messages || []).map((m: DbMessage) => ({
    id: m.id, from: m.from_user, text: m.text,
    ts: new Date(m.created_at).getTime(), read: m.read,
  }));
  return {
    id: row.id, userId: row.seller_id,
    userName: 'Vendeur', userAvatar: '',
    listingId: row.listing_id, listingTitle: row.listing_title,
    listingImage: row.listing_image, listingPrice: row.listing_price,
    messages: msgs,
    unread: myId === row.buyer_id ? row.unread_buyer : row.unread_seller,
    lastTs: row.last_ts ? new Date(row.last_ts).getTime() : undefined,
  };
}

// ── Auth ──────────────────────────────────────────────────────────────────

export async function signInWithGoogle() {
  if (!isSupabaseEnabled || !supabase) return null;
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/dashboard` },
  });
}

export async function signInWithFacebook() {
  if (!isSupabaseEnabled || !supabase) return null;
  return supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: { redirectTo: `${window.location.origin}/dashboard` },
  });
}

export async function signInWithEmail(email: string, password: string) {
  if (!isSupabaseEnabled || !supabase) return null;
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string, name: string) {
  if (!isSupabaseEnabled || !supabase) return null;
  return supabase.auth.signUp({
    email, password,
    options: { data: { full_name: name } },
  });
}

export async function signOut() {
  if (!isSupabaseEnabled || !supabase) return;
  return supabase.auth.signOut();
}

// ── Realtime subscriptions ────────────────────────────────────────────────

export function subscribeToThread(
  threadId: string,
  onMessage: (msg: Message) => void
) {
  if (!isSupabaseEnabled || !supabase) return () => {};
  const channel = supabase
    .channel(`thread:${threadId}`)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'messages',
      filter: `thread_id=eq.${threadId}`,
    }, (payload) => {
      const row = payload.new as DbMessage;
      onMessage({ id: row.id, from: row.from_user, text: row.text,
        ts: new Date(row.created_at).getTime(), read: row.read });
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeToUserThreads(
  userId: string,
  onUpdate: () => void
) {
  if (!isSupabaseEnabled || !supabase) return () => {};
  const channel = supabase
    .channel(`user_threads:${userId}`)
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'messages',
    }, onUpdate)
    .subscribe();
  return () => supabase.removeChannel(channel);
}
