import { Router, Response } from 'express';
import { CommunityRequest } from '../models/CommunityRequest';
import { LISTING_CATEGORIES } from '../models/Listing';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { SAFE_PUBLIC_USER_FIELDS } from './users';

const router = Router();

const formatCommunityRequest = (doc: any) => {
  const json = typeof doc.toJSON === 'function' ? doc.toJSON() : { ...doc, id: String(doc._id) };
  if (json.user_id && typeof json.user_id === 'object' && json.user_id._id) {
    const u = json.user_id;
    json.user = {
      id: String(u._id),
      full_name: u.full_name,
      avatar_url: u.avatar_url,
      location: u.location,
      college_name: u.college_name,
      college_verification_status: u.college_verification_status,
    };
    json.user_id = String(u._id);
  } else if (json.user_id) {
    json.user_id = String(json.user_id);
  }
  return json;
};

// GET /api/community-requests
router.get('/', async (_req, res: Response) => {
  try {
    const docs = await CommunityRequest.find({ status: 'open' })
      .populate('user_id', SAFE_PUBLIC_USER_FIELDS)
      .sort({ created_at: -1 });

    res.json({
      communityRequests: docs.map(formatCommunityRequest),
    });
  } catch (err) {
    console.error('Get community requests error:', err);
    res.status(500).json({ error: 'Failed to load community requests.' });
  }
});

// POST /api/community-requests
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { item_name, category, listing_type, details } = req.body || {};

    if (!item_name || typeof item_name !== 'string' || !item_name.trim()) {
      res.status(400).json({ error: 'Requested item name is required.' });
      return;
    }

    const validCategory = LISTING_CATEGORIES.includes(category) ? category : 'Other';
    const validType = ['rent', 'trade', 'purchase'].includes(listing_type)
      ? listing_type
      : 'rent';

    const created = await CommunityRequest.create({
      user_id: req.userId,
      item_name: item_name.trim(),
      category: validCategory,
      listing_type: validType,
      details: typeof details === 'string' && details.trim() ? details.trim() : undefined,
      status: 'open',
    });

    const populated = await CommunityRequest.findById(created._id).populate(
      'user_id',
      SAFE_PUBLIC_USER_FIELDS
    );

    res.status(201).json({ communityRequest: formatCommunityRequest(populated) });
  } catch (err: any) {
    console.error('Create community request error:', err);
    res.status(400).json({ error: err?.message || 'Failed to post community request.' });
  }
});

export default router;
