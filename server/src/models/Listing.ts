import mongoose, { Schema, Document, Types } from 'mongoose';

export const LISTING_CATEGORIES = [
  'Electronics',
  'Computers and Accessories',
  'Books',
  'Tools and Equipment',
  'Photography',
  'Gaming',
  'Sports Equipment',
  'Cricket Equipment',
  'Fashion & Apparel',
  'Furniture',
  'Other',
] as const;

export const LISTING_CONDITIONS = [
  'Brand New',
  'Like New',
  'Excellent',
  'Good',
  'Fair',
  'Needs Repair',
] as const;

export const DEFECT_TYPES = [
  'No visible damage',
  'Minor scratches',
  'Major scratches',
  'Dents or physical marks',
  'Cracks or broken parts',
  'Functional issues',
  'Other',
] as const;

export interface IListing extends Document {
  user_id: Types.ObjectId;
  title: string;
  description: string;
  category: (typeof LISTING_CATEGORIES)[number];
  condition: (typeof LISTING_CONDITIONS)[number];
  listing_type: 'rent' | 'trade' | 'purchase';

  brand?: string;
  model_name?: string;
  product_age?: string;
  purchase_date?: string;
  original_mrp?: number;
  accessories_included?: string;
  warranty_status?: string;
  invoice_available?: boolean;
  terms_accepted: boolean;
  terms_accepted_at: Date;
  terms_version: string;

  defects?: string[];
  defect_other?: string;
  defect_description?: string;

  included_items?: string[];
  included_custom?: string;
  missing_accessories?: string;

  packaging_available?: boolean;
  warranty_valid?: boolean;
  documentation_notes?: string;

  images: string[];
  condition_images: string[];

  rental_price?: number;
  rental_duration?: 'Hourly' | 'Daily' | 'Weekly';
  availability_status: 'available' | 'booked' | 'unavailable';

  estimated_value?: number;
  trade_desired?: string;
  trade_cash_adjustment?: number;

  purchase_price?: number;

  location: string;
  status: 'active' | 'pending' | 'completed' | 'inactive';
  featured: boolean;
  view_count: number;
  created_at: Date;
  updated_at: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    category: {
      type: String,
      enum: LISTING_CATEGORIES,
      required: true,
      index: true,
    },
    condition: {
      type: String,
      enum: LISTING_CONDITIONS,
      required: true,
    },
    listing_type: {
      type: String,
      enum: ['rent', 'trade', 'purchase'],
      required: true,
      index: true,
    },
    brand: { type: String, trim: true, maxlength: 120 },
    model_name: { type: String, trim: true, maxlength: 120 },
    product_age: { type: String, trim: true, maxlength: 80 },
    purchase_date: { type: String, trim: true },
    original_mrp: { type: Number, min: 0 },
    accessories_included: { type: String, maxlength: 500 },
    warranty_status: { type: String, maxlength: 150 },
    invoice_available: { type: Boolean },
    terms_accepted: { type: Boolean, default: true },
    terms_accepted_at: { type: Date, default: Date.now },
    terms_version: { type: String, default: 'v1.0' },

    defects: {
      type: [String],
      validate: [
        {
          validator: (arr: string[]) =>
            !arr || arr.every((d) => (DEFECT_TYPES as readonly string[]).includes(d)),
          message: 'Invalid defect option.',
        },
        {
          validator: (arr: string[]) =>
            !arr || !arr.includes('No visible damage') || arr.length === 1,
          message: '"No visible damage" cannot be combined with specific defects.',
        },
      ],
    },
    defect_other: { type: String, maxlength: 300 },
    defect_description: { type: String, maxlength: 2000 },

    included_items: { type: [String] },
    included_custom: { type: String, maxlength: 500 },
    missing_accessories: { type: String, maxlength: 500 },

    packaging_available: { type: Boolean },
    warranty_valid: { type: Boolean },
    documentation_notes: { type: String, maxlength: 1000 },

    images: { type: [String], default: [] },
    condition_images: { type: [String], default: [] },

    rental_price: { type: Number, min: 0 },
    rental_duration: { type: String, enum: ['Hourly', 'Daily', 'Weekly'] },
    availability_status: {
      type: String,
      enum: ['available', 'booked', 'unavailable'],
      default: 'available',
    },

    estimated_value: { type: Number, min: 0 },
    trade_desired: { type: String, maxlength: 400 },
    trade_cash_adjustment: { type: Number, default: 0 },

    purchase_price: { type: Number, min: 0 },

    location: {
      type: String,
      default: 'Chitkara University, Rajpura, Punjab, India',
      trim: true,
      maxlength: 200,
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'completed', 'inactive'],
      default: 'active',
      index: true,
    },
    featured: { type: Boolean, default: false },
    view_count: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Listing = mongoose.model<IListing>('Listing', ListingSchema);
