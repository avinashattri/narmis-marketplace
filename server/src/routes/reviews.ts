import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { Review } from '../models/Review';
import { Purchase } from '../models/Purchase';
import { RentalRequest } from '../models/RentalRequest';
import { TradeOffer } from '../models/TradeOffer';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { SAFE_PUBLIC_USER_FIELDS } from './users';

const router = Router();

const formatReview = (doc: any) => {
  const json = typeof doc.toJSON === 'function' ? doc.toJSON() : { ...doc, id: String(doc._id) };
  if (json.reviewer_id && typeof json.reviewer_id === 'object' && json.reviewer_id._id) {
    const r = json.reviewer_id;
    json.reviewer = {
      id: String(r._id),
      full_name: r.full_name,
      avatar_url: r.avatar_url,
    };
    json.reviewer_id = String(r._id);
  } else if (json.reviewer_id) {
    json.reviewer_id = String(json.reviewer_id);
  }
  json.target_user_id = String(json.target_user_id?._id || json.target_user_id);
  if (json.listing_id) {
    json.listing_id = String(json.listing_id?._id || json.listing_id);
  }
  return json;
};

// GET /api/reviews
router.get('/', async (_req, res: Response) => {
  try {
    const docs = await Review.find()
      .populate('reviewer_id', SAFE_PUBLIC_USER_FIELDS)
      .sort({ created_at: -1 });

    res.json({
      reviews: docs.map(formatReview),
    });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: 'Failed to load reviews.' });
  }
});

// POST /api/reviews
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { target_user_id, listing_id, rating, comment } = req.body || {};
    const reviewerId = req.userId!;

    if (!target_user_id || !mongoose.Types.ObjectId.isValid(target_user_id)) {
      res.status(400).json({ error: 'Valid target user ID is required.' });
      return;
    }
    if (String(target_user_id) === reviewerId) {
      res.status(400).json({ error: 'You cannot review your own listing or profile.' });
      return;
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
      return;
    }
    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      res.status(400).json({ error: 'Please write a review comment.' });
      return;
    }

    // Verify genuine completed/approved/accepted transaction eligibility when listing_id is provided
    if (listing_id && mongoose.Types.ObjectId.isValid(listing_id)) {
      const existingReview = await Review.findOne({
        reviewer_id: reviewerId,
        listing_id,
      });
      if (existingReview) {
        res.status(409).json({
          error: 'You have already submitted a review for this transaction.',
        });
        return;
      }

      const [completedPurchase, approvedRental, acceptedTrade] = await Promise.all([
        Purchase.findOne({
          listing_id,
          buyer_id: reviewerId,
          status: { $in: ['completed', 'payment_submitted'] },
        }),
        RentalRequest.findOne({
          listing_id,
          renter_id: reviewerId,
          status: { $in: ['approved', 'completed'] },
        }),
        TradeOffer.findOne({
          listing_id,
          requester_id: reviewerId,
          status: { $in: ['accepted', 'completed'] },
        }),
      ]);

      if (!completedPurchase && !approvedRental && !acceptedTrade) {
        res.status(403).json({
          error:
            'Only members who have completed a purchase, approved rental, or accepted trade for this listing can submit a review.',
        });
        return;
      }
    }

    const created = await Review.create({
      reviewer_id: reviewerId,
      target_user_id,
      listing_id:
        listing_id && mongoose.Types.ObjectId.isValid(listing_id) ? listing_id : undefined,
      rating: numericRating,
      comment: comment.trim(),
    });

    const populated = await Review.findById(created._id).populate(
      'reviewer_id',
      SAFE_PUBLIC_USER_FIELDS
    );

    res.status(201).json({ review: formatReview(populated) });
  } catch (err: any) {
    console.error('Create review error:', err);
    res.status(400).json({ error: err?.message || 'Failed to submit review.' });
  }
});

export default router;
