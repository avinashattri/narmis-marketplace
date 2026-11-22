import mongoose, { Schema, Document, Types } from 'mongoose';
import { LISTING_CATEGORIES } from './Listing';

export interface ICommunityRequest extends Document {
  user_id: Types.ObjectId;
  item_name: string;
  category: (typeof LISTING_CATEGORIES)[number];
  listing_type: 'rent' | 'trade' | 'purchase';
  details?: string;
  status: 'open' | 'fulfilled' | 'closed';
  created_at: Date;
}

const CommunityRequestSchema = new Schema<ICommunityRequest>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    item_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      enum: LISTING_CATEGORIES,
      default: 'Other',
    },
    listing_type: {
      type: String,
      enum: ['rent', 'trade', 'purchase'],
      default: 'rent',
    },
    details: {
      type: String,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['open', 'fulfilled', 'closed'],
      default: 'open',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
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

export const CommunityRequest = mongoose.model<ICommunityRequest>(
  'CommunityRequest',
  CommunityRequestSchema
);
