import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { Purchase } from '../models/Purchase';
import { Listing } from '../models/Listing';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { emitToUsers } from '../socket';

const router = Router();

const formatPurchase = (doc: any) => {
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

  json.buyer_id = String(json.buyer_id?._id || json.buyer_id);
  json.seller_id = String(json.seller_id?._id || json.seller_id);
  return json;
};

// GET /api/purchases
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.userId);
    const docs = await Purchase.find({
      $or: [{ buyer_id: uid }, { seller_id: uid }],
    })
      .populate('listing_id', 'title images')
      .sort({ created_at: -1 });

    res.json({
      purchases: docs.map(formatPurchase),
    });
  } catch (err) {
    console.error('Get purchases error:', err);
    res.status(500).json({ error: 'Failed to load purchases.' });
  }
});

// POST /api/purchases
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { listingId, address, paymentReference } = req.body || {};

    if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
      res.status(400).json({ error: 'Valid listing ID is required.' });
      return;
    }
    if (!address || typeof address !== 'string' || !address.trim()) {
      res.status(400).json({ error: 'Handover / delivery address is required.' });
      return;
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found.' });
      return;
    }

    if (String(listing.user_id) === req.userId) {
      res.status(400).json({ error: 'You cannot purchase your own listing.' });
      return;
    }

    const receiptNumber = 'NRM-' + Math.floor(100000 + Math.random() * 900000);
    const amount = Number(listing.purchase_price) || 0;

    // Preserve honest payment status: never claim payment is verified automatically
    const created = await Purchase.create({
      listing_id: listing._id,
      buyer_id: req.userId,
      seller_id: listing.user_id,
      amount,
      status: 'payment_submitted',
      payment_method: 'UPI QR Payment',
      payment_reference:
        typeof paymentReference === 'string' && paymentReference.trim()
          ? paymentReference.trim()
          : undefined,
      payment_confirmed_by_buyer: true,
      payment_confirmed_at: new Date(),
      payment_verification_status: 'Payment Submitted',
      receipt_number: receiptNumber,
      shipping_address: address.trim(),
    });

    listing.status = 'pending';
    await listing.save();

    const populated = await Purchase.findById(created._id).populate('listing_id', 'title images');
    const formatted = formatPurchase(populated);

    emitToUsers([String(listing.user_id), req.userId!], 'purchase_updated', formatted);

    res.status(201).json({ purchase: formatted });
  } catch (err: any) {
    console.error('Submit purchase payment error:', err);
    res.status(400).json({ error: err?.message || 'Failed to record payment submission.' });
  }
});

// PATCH /api/purchases/:id/verify (Seller verifies receipt of UPI payment)
router.patch('/:id/verify', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { verified } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: 'Purchase record not found.' });
      return;
    }

    const purchase = await Purchase.findById(id);
    if (!purchase) {
      res.status(404).json({ error: 'Purchase record not found.' });
      return;
    }

    if (String(purchase.seller_id) !== req.userId) {
      res.status(403).json({ error: 'Only the seller can verify payment receipt.' });
      return;
    }

    if (verified) {
      purchase.payment_verification_status = 'Verified';
      purchase.status = 'completed';
      await Listing.findByIdAndUpdate(purchase.listing_id, { status: 'completed' });
    } else {
      purchase.payment_verification_status = 'Cancelled';
      purchase.status = 'cancelled';
      await Listing.findByIdAndUpdate(purchase.listing_id, { status: 'active' });
    }

    await purchase.save();
    const populated = await Purchase.findById(purchase._id).populate('listing_id', 'title images');
    const formatted = formatPurchase(populated);

    emitToUsers([String(purchase.buyer_id), String(purchase.seller_id)], 'purchase_updated', formatted);

    res.json({ purchase: formatted });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Failed to update payment verification.' });
  }
});

export default router;
