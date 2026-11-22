import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';

const router = Router();

// Strictly safe public fields — NEVER expose email, password_hash, college_id_number, or college_id_image
export const SAFE_PUBLIC_USER_FIELDS =
  'full_name avatar_url bio location college_name college_verification_status rating review_count created_at';

// GET /api/users/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    const userDoc = await User.findById(id).select(SAFE_PUBLIC_USER_FIELDS);
    if (!userDoc) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    const json = userDoc.toJSON() as Record<string, any>;
    json.joined_date = new Date(userDoc.created_at).toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    });

    res.json({ user: json });
  } catch (err) {
    console.error('Get public user profile error:', err);
    res.status(500).json({ error: 'Failed to load public profile.' });
  }
});

export default router;
