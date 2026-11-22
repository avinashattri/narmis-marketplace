import { v2 as cloudinary } from 'cloudinary';

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export const isCloudinaryConfigured = (): boolean => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  return Boolean(
    name &&
      key &&
      secret &&
      name !== 'your_cloudinary_cloud_name' &&
      key !== 'your_cloudinary_api_key' &&
      secret !== 'your_cloudinary_api_secret'
  );
};

export const configureCloudinary = (): void => {
  if (!isCloudinaryConfigured()) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

export interface CloudinaryUploadResult {
  url: string;
  public_id?: string;
}

export const uploadImageToCloudinary = async (
  dataUrlOrUrl: string,
  userId: string,
  folder: 'product' | 'condition' | 'avatar' | 'college-id'
): Promise<CloudinaryUploadResult> => {
  if (!dataUrlOrUrl || typeof dataUrlOrUrl !== 'string') {
    throw new Error('Invalid image payload.');
  }

  // Already a hosted https URL
  if (/^https?:\/\//i.test(dataUrlOrUrl)) {
    return { url: dataUrlOrUrl };
  }

  const match = dataUrlOrUrl.match(/^data:(image\/(jpeg|png|webp));base64,(.+)$/);
  if (!match) {
    throw new Error('Unsupported image format. Only JPG, PNG, and WebP are accepted.');
  }

  const base64Data = match[3];
  const approxBytes = Math.ceil((base64Data.length * 3) / 4);
  if (approxBytes > MAX_BYTES) {
    throw new Error('Image exceeds the 8 MB maximum size limit.');
  }

  const isPrivate = folder === 'college-id';

  if (isCloudinaryConfigured()) {
    configureCloudinary();
    const res = await cloudinary.uploader.upload(dataUrlOrUrl, {
      folder: `narmis/${folder}/${userId}`,
      resource_type: 'image',
      type: isPrivate ? 'authenticated' : 'upload',
      access_mode: isPrivate ? 'authenticated' : 'public',
    });
    return {
      url: isPrivate ? `cloudinary://authenticated/${res.public_id}` : res.secure_url,
      public_id: res.public_id,
    };
  }

  // Fallback for local testing before Cloudinary keys are entered
  return {
    url: dataUrlOrUrl,
    public_id: `local-${folder}-${userId}-${Date.now()}`,
  };
};
