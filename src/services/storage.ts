import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Uploads an image (provided as a data URL from the file picker) to Supabase Storage
 * under `<bucket>/<userId>/<folder>/<random>.<ext>` and returns its public URL.
 *
 * Storage RLS (see migrations) only lets a user write inside their own `<userId>/` folder.
 * Already-hosted URLs (http/https) are returned unchanged.
 * When Supabase Storage upload fails or bucket is not created yet, falls back gracefully.
 */
export const uploadImage = async (
  dataUrlOrUrl: string,
  userId: string,
  folder: 'product' | 'condition' | 'avatar',
  bucket = 'listings'
): Promise<string> => {
  if (!dataUrlOrUrl || !dataUrlOrUrl.startsWith('data:')) return dataUrlOrUrl;
  if (!isSupabaseConfigured || !supabase) return dataUrlOrUrl;

  const match = dataUrlOrUrl.match(/^data:(image\/(jpeg|png|webp));base64,/);
  if (!match) throw new Error('Unsupported image format. Use JPG, PNG or WEBP.');

  const mime = match[1];
  const ext = match[2] === 'jpeg' ? 'jpg' : match[2];
  const blob = await (await fetch(dataUrlOrUrl)).blob();
  const path = `${userId}/${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: mime,
    upsert: false,
  });

  if (error) {
    console.warn(`Supabase storage (${bucket}) upload fallback:`, error.message);
    return dataUrlOrUrl;
  }

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
};

export const uploadImages = (
  images: string[],
  userId: string,
  folder: 'product' | 'condition'
) => Promise.all(images.map((img) => uploadImage(img, userId, folder)));

/**
 * Uploads a private verification document (e.g., College ID image) into the
 * private `college-ids` bucket. Returns the private storage path (never a public URL).
 * Only the owning user and service_role/admin can access it.
 */
export const uploadPrivateCollegeId = async (
  dataUrl: string,
  userId: string
): Promise<string> => {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
  if (!isSupabaseConfigured || !supabase) {
    return dataUrl;
  }

  const match = dataUrl.match(/^data:(image\/(jpeg|png|webp));base64,/);
  if (!match) throw new Error('Unsupported College ID format. Use JPG, PNG or WEBP.');

  const mime = match[1];
  const ext = match[2] === 'jpeg' ? 'jpg' : match[2];
  const blob = await (await fetch(dataUrl)).blob();
  const path = `${userId}/id-card-${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from('college-ids').upload(path, blob, {
    contentType: mime,
    upsert: true,
  });

  if (error) {
    console.warn('Supabase college-ids bucket upload fallback:', error.message);
    return `pending-bucket:${path}`;
  }

  return path;
};
