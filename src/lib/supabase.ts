/**
 * Supabase client — Le Fennec DZ Market
 * Variables d'env requises dans Vercel :
 *   VITE_SUPABASE_URL      → https://xxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY → eyJhbGciOi...
 */
import { createClient } from '@supabase/supabase-js';

const URL_KEY  = import.meta.env.VITE_SUPABASE_URL       as string | undefined;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY  as string | undefined;

export const supabase = URL_KEY && ANON_KEY
  ? createClient(URL_KEY, ANON_KEY)
  : null;

export const isSupabaseEnabled = !!supabase;

export type DbListing = {
  id: string; title: string; description: string;
  price: number; currency: string; negotiable: boolean;
  category_id: string; category: string;
  wilaya_id: string; wilaya_name: string; commune?: string;
  condition: string; images: string[]; image_url: string;
  attributes: Record<string, string>;
  user_id: string; status: string;
  views: number; is_premium: boolean; is_urgent: boolean;
  is_verified: boolean; boost_level: number;
  trust_score: number; quality_score: number;
  phone?: string; whatsapp?: boolean;
  created_at: string; updated_at: string;
};

export type DbMessage = {
  id: string; thread_id: string;
  from_user: string; text: string;
  read: boolean; type: string; created_at: string;
};

export type DbThread = {
  id: string; listing_id: string;
  buyer_id: string; seller_id: string;
  listing_title: string; listing_image?: string;
  listing_price?: number;
  unread_buyer: number; unread_seller: number;
  last_message?: string; last_ts?: string; created_at: string;
};
