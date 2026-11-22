import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { RentalRequest } from '../models/RentalRequest';
import { Listing } from '../models/Listing';
import { TermsAcceptance } from '../models/TermsAcceptance';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { SAFE_PUBLIC_USER_FIELDS } from './users';
import { emitToUsers } from '../socket';

const router = Router();

const formatRental = (doc: any) => {
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

  if (json.renter_id && typeof json.renter_id === 'object' && json.renter_id._id) {
    const r = json.renter_id;
    json.renter = {
      id: String(r._id),
      full_name: r.full_name,
      avatar_url: r.avatar_url,
      location: r.location,
      college_name: r.college_name,
      college_verification_status: r.college_verification_status,
    };
    json.renter_id = String(r._id);
  } else if (json.renter_id) {
    json.renter_id = String(json.renter_id);
  }

  if (json.owner_id) {
    json.owner_id = String(json.owner_id._id || json.owner_id);
  }
  return json;
};

// GET /api/rentals
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.userId);
    const docs = await RentalRequest.find({
      $or: [{ renter_id: uid }, { owner_id: uid }],
    })
      .populate('listing_id', 'title images')
      .populate('renter_id', SAFE_PUBLIC_USER_FIELDS)
      .sort({ created_at: -1 });

    res.json({
      rentalRequests: docs.map(formatRental),
    });
  } catch (err) {
    console.error('Get rental requests error:', err);
    res.status(500).json({ error: 'Failed to load rental requests.' });
  }
});

// POST /api/rentals
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      listing_id,
      start_date,
      end_date,
      duration_type,
      duration_units,
      total_amount,
      message,
      terms_accepted,
      terms_version,
    } = req.body || {};

    if (!listing_id || !mongoose.Types.ObjectId.isValid(listing_id)) {
      res.status(400).json({ error: 'Valid listing ID is required.' });
      return;
    }

    const listing = await Listing.findById(listing_id);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found.' });
      return;
    }

    if (String(listing.user_id) === req.userId) {
      res.status(400).json({ error: 'You cannot rent your own listing.' });
      return;
    }

    const created = await RentalRequest.create({
      listing_id: listing._id,
      renter_id: req.userId,
      owner_id: listing.user_id,
      start_date,
      end_date,
      duration_type: duration_type || listing.rental_duration || 'Daily',
      duration_units: Number(duration_units) || 1,
      total_amount: Number(total_amount) || 0,
      status: 'pending',
      message: message || '',
      terms_accepted: Boolean(terms_accepted ?? true),
      terms_accepted_at: new Date(),
      terms_version: terms_version || 'v1.0',
    });

    await TermsAcceptance.create({
      user_id: req.userId,
      terms_type: 'rental_agreement',
      terms_version: terms_version || 'v1.0',
      reference_id: created._id,
      ip_address: req.ip,
    });

    const populated = await RentalRequest.findById(created._id)
      .populate('listing_id', 'title images')
      .populate('renter_id', SAFE_PUBLIC_USER_FIELDS);

    const formatted = formatRental(populated);
    emitToUsers([String(listing.user_id), req.userId!], 'rental_updated', formatted);

    res.status(201).json({ rentalRequest: formatted });
  } catch (err: any) {
    console.error('Create rental request error:', err);
    res.status(400).json({ error: err?.message || 'Failed to create rental request.' });
  }
});

// PATCH /api/rentals/:id/status
router.patch('/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: 'Rental request not found.' });
      return;
    }
    if (!['pending', 'approved', 'rejected', 'completed', 'cancelled'].includes(status)) {
      res.status(400).json({ error: 'Invalid rental status.' });
      return;
    }

    const rental = await RentalRequest.findById(id);
    if (!rental) {
      res.status(404).json({ error: 'Rental request not found.' });
      return;
    }

    const isOwner = String(rental.owner_id) === req.userId;
    const isRenter = String(rental.renter_id) === req.userId;

    if (!isOwner && !isRenter) {
      res.status(403).json({ error: 'Forbidden: You are not a participant in this rental.' });
      return;
    }

    if ((status === 'approved' || status === 'rejected') && !isOwner) {
      res.status(403).json({ error: 'Only the listing owner can approve or reject rental requests.' });
      return;
    }
    if (status === 'cancelled' && !isRenter && !isOwner) {
      res.status(403).json({ error: 'Unauthorized status change.' });
      return;
    }

    rental.status = status;
    await rental.save();

    const populated = await RentalRequest.findById(rental._id)
      .populate('listing_id', 'title images')
      .populate('renter_id', SAFE_PUBLIC_USER_FIELDS);

    const formatted = formatRental(populated);
    emitToUsers([String(rental.owner_id), String(rental.renter_id)], 'rental_updated', formatted);

    res.json({ rentalRequest: formatted });
  } catch (err: any) {
    console.error('Update rental status error:', err);
    res.status(400).json({ error: err?.message || 'Failed to update rental status.' });
  }
});

export default router;
