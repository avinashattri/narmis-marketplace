import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { uploadImageToCloudinary } from '../config/cloudinary';

const router = Router();

const ALLOWED_FOLDERS = ['product', 'condition', 'avatar', 'college-id'] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

// POST /api/upload
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { image, images, folder } = req.body || {};
    const targetFolder: AllowedFolder = ALLOWED_FOLDERS.includes(folder)
      ? folder
      : 'product';
    const userId = req.userId!;

    if (Array.isArray(images)) {
      if (images.length > 12) {
        res.status(400).json({ error: 'Maximum 12 images allowed per upload batch.' });
        return;
      }
      const results = await Promise.all(
        images.map((img: string) => uploadImageToCloudinary(img, userId, targetFolder))
      );
      res.json({
        urls: results.map((r) => r.url),
        results,
      });
      return;
    }

    if (typeof image === 'string' && image.trim()) {
      const result = await uploadImageToCloudinary(image, userId, targetFolder);
      res.json({
        url: result.url,
        public_id: result.public_id,
      });
      return;
    }

    res.status(400).json({ error: 'No image data provided.' });
  } catch (err: any) {
    console.error('Image upload error:', err);
    res.status(400).json({ error: err?.message || 'Image upload failed.' });
  }
});

export default router;
