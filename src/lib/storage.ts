/**
 * Supabase Storage — upload photos d'annonces
 * Bucket "listings" doit être créé dans Supabase Dashboard → Storage
 */
import { supabase, isSupabaseEnabled } from './supabase';

export async function uploadListingImage(
  file: File,
  userId: string,
  listingId: string
): Promise<string | null> {
  if (!isSupabaseEnabled || !supabase) {
    // Fallback: local object URL (session only)
    return URL.createObjectURL(file);
  }

  const ext  = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${listingId}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('listings')
    .upload(path, file, {
      cacheControl: '3600',
      upsert:       false,
      contentType:  file.type,
    });

  if (error) {
    console.warn('Upload error:', error.message);
    return URL.createObjectURL(file); // fallback
  }

  const { data: { publicUrl } } = supabase.storage
    .from('listings')
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function uploadMultipleImages(
  files: File[],
  userId: string,
  listingId: string
): Promise<string[]> {
  const urls = await Promise.all(
    files.map(f => uploadListingImage(f, userId, listingId))
  );
  return urls.filter(Boolean) as string[];
}

export async function deleteListingImage(url: string): Promise<void> {
  if (!isSupabaseEnabled || !supabase) return;
  // Extract path from URL
  const match = url.match(/listings\/(.+)$/);
  if (!match) return;
  await supabase.storage.from('listings').remove([match[1]]);
}
