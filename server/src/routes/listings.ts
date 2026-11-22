import { Router, Response } from 'express';
import mongoose from 'mongoose';
import {
  Listing,
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
  DEFECT_TYPES,
} from '../models/Listing';
import { TermsAcceptance } from '../models/TermsAcceptance';
import { AuthenticatedRequest, optionalAuth, requireAuth } from '../middleware/auth';
import { SAFE_PUBLIC_USER_FIELDS } from './users';

const router = Router();

const formatListingResponse = (doc: any) => {
  const json = typeof doc.toJSON === 'function' ? doc.toJSON() : { ...doc, id: String(doc._id) };
  if (json.user_id && typeof json.user_id === 'object' && json.user_id._id) {
    const u = json.user_id;
    json.user = {
      id: String(u._id || u.id),
      full_name: u.full_name,
      avatar_url: u.avatar_url,
      bio: u.bio,
      location: u.location,
      college_name: u.college_name,
      college_verification_status: u.college_verification_status || 'Not Submitted',
      rating: u.rating ?? 5.0,
      review_count: u.review_count ?? 0,
    };
    json.user_id = String(u._id || u.id);
  } else if (json.user_id) {
    json.user_id = String(json.user_id);
  }
  return json;
};

// GET /api/listings
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filter: Record<string, any> = req.userId
      ? {
          $or: [
            { status: 'active' },
            { user_id: new mongoose.Types.ObjectId(req.userId) },
          ],
        }
      : { status: 'active' };

    const docs = await Listing.find(filter)
      .populate('user_id', SAFE_PUBLIC_USER_FIELDS)
      .sort({ created_at: -1 });

    res.json({
      listings: docs.map(formatListingResponse),
    });
  } catch (err) {
    console.error('Get listings error:', err);
    res.status(500).json({ error: 'Failed to load marketplace listings.' });
  }
});

// GET /api/listings/:id
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: 'Listing not found.' });
      return;
    }

    const doc = await Listing.findById(id).populate('user_id', SAFE_PUBLIC_USER_FIELDS);
    if (!doc) {
      res.status(404).json({ error: 'Listing not found.' });
      return;
    }

    res.json({ listing: formatListingResponse(doc) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load listing details.' });
  }
});

// POST /api/listings
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body || {};
    const {
      title,
      description,
      category,
      condition,
      listing_type,
      defects,
      rental_price,
      estimated_value,
      purchase_price,
      original_mrp,
      purchase_date,
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Listing title is required.' });
      return;
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      res.status(400).json({ error: 'Detailed product description is required.' });
      return;
    }
    if (!LISTING_CATEGORIES.includes(category)) {
      res.status(400).json({ error: 'Invalid product category.' });
      return;
    }
    if (!LISTING_CONDITIONS.includes(condition)) {
      res.status(400).json({ error: 'Invalid product condition.' });
      return;
    }
    if (!['rent', 'trade', 'purchase'].includes(listing_type)) {
      res.status(400).json({ error: 'Invalid listing type.' });
      return;
    }

    if (listing_type === 'rent' && (typeof rental_price !== 'number' || rental_price <= 0)) {
      res.status(400).json({ error: 'Rental price must be a positive number.' });
      return;
    }
    if (listing_type === 'trade' && (typeof estimated_value !== 'number' || estimated_value <= 0)) {
      res.status(400).json({ error: 'Estimated trade value must be a positive number.' });
      return;
    }
    if (
      listing_type === 'purchase' &&
      (typeof purchase_price !== 'number' || purchase_price <= 0)
    ) {
      res.status(400).json({ error: 'Selling price must be a positive number.' });
      return;
    }
    if (original_mrp !== undefined && (typeof original_mrp !== 'number' || original_mrp <= 0)) {
      res.status(400).json({ error: 'Original retail MRP must be a positive number.' });
      return;
    }
    if (purchase_date) {
      const parsedDate = new Date(purchase_date);
      if (isNaN(parsedDate.getTime()) || parsedDate > new Date()) {
        res.status(400).json({ error: 'Purchase date cannot be in the future.' });
        return;
      }
    }

    if (Array.isArray(defects)) {
      const validDefects = defects.every((d: string) =>
        (DEFECT_TYPES as readonly string[]).includes(d)
      );
      if (!validDefects) {
        res.status(400).json({ error: 'Invalid defect disclosure option.' });
        return;
      }
      if (defects.includes('No visible damage') && defects.length > 1) {
        res
          .status(400)
          .json({ error: '"No visible damage" cannot be combined with specific defects.' });
        return;
      }
    }

    const created = await Listing.create({
      user_id: req.userId,
      title: title.trim(),
      description: description.trim(),
      category,
      condition,
      listing_type,
      brand: body.brand?.trim() || undefined,
      model_name: body.model_name?.trim() || undefined,
      product_age: body.product_age || undefined,
      purchase_date: body.purchase_date || undefined,
      original_mrp: body.original_mrp,
      accessories_included: body.accessories_included,
      warranty_status: body.warranty_status,
      invoice_available: body.invoice_available,
      defects: Array.isArray(defects) && defects.length > 0 ? defects : undefined,
      defect_other: body.defect_other?.trim() || undefined,
      defect_description: body.defect_description?.trim() || undefined,
      included_items:
        Array.isArray(body.included_items) && body.included_items.length > 0
          ? body.included_items
          : undefined,
      included_custom: body.included_custom?.trim() || undefined,
      missing_accessories: body.missing_accessories?.trim() || undefined,
      packaging_available: body.packaging_available,
      warranty_valid: body.warranty_valid,
      documentation_notes: body.documentation_notes?.trim() || undefined,
      images: Array.isArray(body.images) ? body.images : [],
      condition_images: Array.isArray(body.condition_images) ? body.condition_images : [],
      terms_accepted: true,
      terms_accepted_at: new Date(),
      terms_version: body.terms_version || 'v1.0',
      rental_price: body.rental_price,
      rental_duration: body.rental_duration,
      availability_status: body.availability_status || 'available',
      estimated_value: body.estimated_value,
      trade_desired: body.trade_desired,
      trade_cash_adjustment: body.trade_cash_adjustment ?? 0,
      purchase_price: body.purchase_price,
      location: body.location?.trim() || 'Chitkara University, Rajpura, Punjab, India',
      status: 'active',
      featured: Boolean(body.featured),
    });

    await TermsAcceptance.create({
      user_id: req.userId,
      terms_type: 'listing_creation',
      terms_version: body.terms_version || 'v1.0',
      reference_id: created._id,
      ip_address: req.ip,
    });

    const populated = await Listing.findById(created._id).populate(
      'user_id',
      SAFE_PUBLIC_USER_FIELDS
    );

    res.status(201).json({ listing: formatListingResponse(populated) });
  } catch (err: any) {
    console.error('Create listing error:', err);
    res.status(400).json({ error: err?.message || 'Failed to publish listing.' });
  }
});

// PUT /api/listings/:id
router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: 'Listing not found.' });
      return;
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found.' });
      return;
    }

    if (String(listing.user_id) !== req.userId) {
      res.status(403).json({ error: 'Forbidden: You can only edit your own listings.' });
      return;
    }

    const body = req.body || {};
    const updatableFields = [
      'title',
      'description',
      'category',
      'condition',
      'listing_type',
      'brand',
      'model_name',
      'product_age',
      'purchase_date',
      'original_mrp',
      'accessories_included',
      'warranty_status',
      'invoice_available',
      'defects',
      'defect_other',
      'defect_description',
      'included_items',
      'included_custom',
      'missing_accessories',
      'packaging_available',
      'warranty_valid',
      'documentation_notes',
      'images',
      'condition_images',
      'rental_price',
      'rental_duration',
      'availability_status',
      'estimated_value',
      'trade_desired',
      'trade_cash_adjustment',
      'purchase_price',
      'location',
      'status',
      'featured',
    ];

    for (const key of updatableFields) {
      if (key in body) {
        (listing as any)[key] = body[key];
      }
    }

    await listing.save();
    const populated = await Listing.findById(listing._id).populate(
      'user_id',
      SAFE_PUBLIC_USER_FIELDS
    );

    res.json({ listing: formatListingResponse(populated) });
  } catch (err: any) {
    console.error('Update listing error:', err);
    res.status(400).json({ error: err?.message || 'Failed to update listing.' });
  }
});

// DELETE /api/listings/:id
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: 'Listing not found.' });
      return;
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found.' });
      return;
    }

    if (String(listing.user_id) !== req.userId) {
      res.status(403).json({ error: 'Forbidden: You can only delete your own listings.' });
      return;
    }

    await listing.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error('Delete listing error:', err);
    res.status(500).json({ error: 'Failed to delete listing.' });
  }
});

export default router;
