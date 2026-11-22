import { supabase, isSupabaseConfigured } from './supabase';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB (matches Supabase Storage bucket limit)

const dataUrlToBlob = (dataUrl: string): { blob: Blob; mime: string; ext: string } => {
  const match = dataUrl.match(/^data:(image\/(jpeg|jpg|png|webp));base64,(.+)$/i);
  if (!match) {
    throw new Error('Unsupported image format. Please use JPG, PNG, or WEBP.');
  }

  const rawMime = match[1].toLowerCase();
  const mime = rawMime === 'image/jpg' ? 'image/jpeg' : rawMime;
  const rawExt = match[2].toLowerCase();
  const ext = rawExt === 'jpeg' || rawExt === 'jpg' ? 'jpg' : rawExt;
  const base64 = match[3];

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new Error('Image exceeds the 8 MB upload limit. Please choose a smaller photo.');
  }

  return { blob: new Blob([bytes], { type: mime }), mime, ext };
};

/**
 * Uploads an image (provided as a data URL from the file picker) to Supabase Storage
 * under `<bucket>/<userId>/<folder>/<uuid>.<ext>` and returns its public URL.
 *
 * Already-hosted HTTP(S) URLs are returned unchanged.
 * Throws a descriptive error if Supabase is not configured or the upload fails
 * so callers never silently persist broken/base64 URLs.
 */
export const uploadImage = async (
  dataUrlOrUrl: string,
  userId: string,
  folder: 'product' | 'condition' | 'avatar',
  bucket = 'listings'
): Promise<string> => {
  if (!dataUrlOrUrl) {
    throw new Error('Image source is empty.');
  }
  if (!dataUrlOrUrl.startsWith('data:')) {
    return dataUrlOrUrl;
  }
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase Storage is not configured. Cannot upload listing image.');
  }

  const { blob, mime, ext } = dataUrlToBlob(dataUrlOrUrl);
  const path = `${userId}/${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: mime,
    upsert: false,
  });

  if (error) {
    throw new Error(`Image upload to Supabase Storage failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error('Supabase Storage did not return a public URL for the uploaded image.');
  }

  return data.publicUrl;
};

export const uploadImages = (
  images: string[],
  userId: string,
  folder: 'product' | 'condition'
): Promise<string[]> => Promise.all(images.map((img) => uploadImage(img, userId, folder, 'listings')));

/**
 * Best-effort removal of previously uploaded Supabase Storage objects belonging
 * to `userId` inside `bucket` when a listing is deleted.
 */
export const deleteStorageImagesByUrls = async (
  urls: string[],
  userId: string,
  bucket = 'listings'
): Promise<void> => {
  if (!isSupabaseConfigured || !supabase || !urls.length) return;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const paths = urls
    .map((u) => {
      const idx = u.indexOf(marker);
      return idx >= 0 ? decodeURIComponent(u.slice(idx + marker.length)) : null;
    })
    .filter((p): p is string => Boolean(p && p.startsWith(`${userId}/`)));

  if (paths.length === 0) return;

  try {
    await supabase.storage.from(bucket).remove(paths);
  } catch (err) {
    console.warn(`[NARMIS] Storage cleanup notice (${bucket}):`, err);
  }
};

/**
 * Uploads a private verification document (e.g., College ID image) into the
 * private `college-ids` bucket. Returns the private storage path (never a public URL).
 */
export const uploadPrivateCollegeId = async (
  dataUrl: string,
  userId: string
): Promise<string> => {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase Storage is not configured.');
  }

  const { blob, mime, ext } = dataUrlToBlob(dataUrl);
  const path = `${userId}/id-card-${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from('college-ids').upload(path, blob, {
    contentType: mime,
    upsert: true,
  });

  if (error) {
    throw new Error(`College ID upload failed: ${error.message}`);
  }

  return path;
};
