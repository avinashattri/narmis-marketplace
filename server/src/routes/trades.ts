import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { TradeOffer } from '../models/TradeOffer';
import { Listing } from '../models/Listing';
import { TermsAcceptance } from '../models/TermsAcceptance';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { SAFE_PUBLIC_USER_FIELDS } from './users';
import { emitToUsers } from '../socket';

const router = Router();

const formatTrade = (doc: any) => {
  const json = typeof doc.toJSON === 'function' ? doc.toJSON() : { ...doc, id: String(doc._id) };
  if (json.listing_id && typeof json.listing_id === 'object' && json.listing_id._id) {
    json.listing = {
      id: String(json.listing_id._id),
      title: json.listing_id.title,
      images: json.listing_id.images || [],
    };
    json.listing_id = String(json.listing_id._id);
  } else if (json.listing_id) {
    json.listing_id = String(json.listing_id);
  }

  if (json.requester_id && typeof json.requester_id === 'object' && json.requester_id._id) {
    const r = json.requester_id;
    json.requester = {
      id: String(r._id),
      full_name: r.full_name,
      avatar_url: r.avatar_url,
      location: r.location,
      college_name: r.college_name,
      college_verification_status: r.college_verification_status,
    };
    json.requester_id = String(r._id);
  } else if (json.requester_id) {
    json.requester_id = String(json.requester_id);
  }

  if (json.owner_id) {
    json.owner_id = String(json.owner_id._id || json.owner_id);
  }
  return json;
};

// GET /api/trades
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.userId);
    const docs = await TradeOffer.find({
      $or: [{ requester_id: uid }, { owner_id: uid }],
    })
      .populate('listing_id', 'title images')
      .populate('requester_id', SAFE_PUBLIC_USER_FIELDS)
      .sort({ created_at: -1 });

    res.json({
      tradeOffers: docs.map(formatTrade),
    });
  } catch (err) {
    console.error('Get trade offers error:', err);
    res.status(500).json({ error: 'Failed to load trade offers.' });
  }
});

// POST /api/trades
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      listing_id,
      offered_item_title,
      offered_item_description,
      offered_item_image,
      offered_item_value,
      cash_adjustment,
      negotiation_notes,
      terms_accepted,
    } = req.body || {};

    if (!listing_id || !mongoose.Types.ObjectId.isValid(listing_id)) {
      res.status(400).json({ error: 'Valid listing ID is required.' });
      return;
    }
    if (!offered_item_title || typeof offered_item_title !== 'string' || !offered_item_title.trim()) {
      res.status(400).json({ error: 'Offered item title is required.' });
      return;
    }

    const listing = await Listing.findById(listing_id);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found.' });
      return;
    }

    if (String(listing.user_id) === req.userId) {
      res.status(400).json({ error: 'You cannot propose a trade on your own listing.' });
      return;
    }

    const created = await TradeOffer.create({
      listing_id: listing._id,
      requester_id: req.userId,
      owner_id: listing.user_id,
      offered_item_title: offered_item_title.trim(),
      offered_item_description: offered_item_description?.trim() || '',
      offered_item_image: offered_item_image || undefined,
      offered_item_value: Number(offered_item_value) || 0,
      cash_adjustment: Number(cash_adjustment) || 0,
      status: 'pending',
      negotiation_notes: negotiation_notes?.trim() || undefined,
      terms_accepted: Boolean(terms_accepted ?? true),
      terms_accepted_at: new Date(),
    });

    await TermsAcceptance.create({
      user_id: req.userId,
      terms_type: 'trade_agreement',
      terms_version: 'v1.0',
      reference_id: created._id,
      ip_address: req.ip,
    });

    const populated = await TradeOffer.findById(created._id)
      .populate('listing_id', 'title images')
      .populate('requester_id', SAFE_PUBLIC_USER_FIELDS);

    const formatted = formatTrade(populated);
    emitToUsers([String(listing.user_id), req.userId!], 'trade_updated', formatted);

    res.status(201).json({ tradeOffer: formatted });
  } catch (err: any) {
    console.error('Create trade offer error:', err);
    res.status(400).json({ error: err?.message || 'Failed to submit trade offer.' });
  }
});

// PATCH /api/trades/:id/status
router.patch('/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: 'Trade offer not found.' });
      return;
    }
    if (!['pending', 'negotiating', 'accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
      res.status(400).json({ error: 'Invalid trade offer status.' });
      return;
    }

    const trade = await TradeOffer.findById(id);
    if (!trade) {
      res.status(404).json({ error: 'Trade offer not found.' });
      return;
    }

    const isOwner = String(trade.owner_id) === req.userId;
    const isRequester = String(trade.requester_id) === req.userId;

    if (!isOwner && !isRequester) {
      res.status(403).json({ error: 'Forbidden: You are not a participant in this trade offer.' });
      return;
    }

    if ((status === 'accepted' || status === 'rejected') && !isOwner) {
      res.status(403).json({ error: 'Only the listing owner can accept or reject trade offers.' });
      return;
    }

    trade.status = status;
    await trade.save();

    const populated = await TradeOffer.findById(trade._id)
      .populate('listing_id', 'title images')
      .populate('requester_id', SAFE_PUBLIC_USER_FIELDS);

    const formatted = formatTrade(populated);
    emitToUsers([String(trade.owner_id), String(trade.requester_id)], 'trade_updated', formatted);

    res.json({ tradeOffer: formatted });
  } catch (err: any) {
    console.error('Update trade status error:', err);
    res.status(400).json({ error: err?.message || 'Failed to update trade offer status.' });
  }
});

export default router;
