import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { SavedListing } from '../models/SavedListing';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/saved
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const saved = await SavedListing.find({ user_id: req.userId }).lean();
    res.json({
      savedIds: saved.map((s) => String(s.listing_id)),
    });
  } catch (err) {
    console.error('Get saved listings error:', err);
    res.status(500).json({ error: 'Failed to load saved listings.' });
  }
});

// POST /api/saved/:listingId (toggle save/unsave)
router.post('/:listingId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const listingId = String(req.params.listingId);
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      res.status(400).json({ error: 'Invalid listing ID.' });
      return;
    }

    const existing = await SavedListing.findOne({
      user_id: req.userId,
      listing_id: listingId,
    });

    if (existing) {
      await existing.deleteOne();
      res.json({ saved: false, listingId });
      return;
    }

    await SavedListing.create({
      user_id: req.userId,
      listing_id: listingId,
    });

    res.status(201).json({ saved: true, listingId });
  } catch (err) {
    console.error('Toggle saved listing error:', err);
    res.status(500).json({ error: 'Failed to update saved listing.' });
  }
});

export default router;
