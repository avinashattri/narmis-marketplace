import mongoose, { Schema, Document, Types } from 'mongoose';

export type TermsType =
  | 'listing_creation'
  | 'rental_agreement'
  | 'trade_agreement'
  | 'account_signup';

export interface ITermsAcceptance extends Document {
  user_id: Types.ObjectId;
  terms_type: TermsType;
  terms_version: string;
  reference_id?: Types.ObjectId;
  ip_address?: string;
  accepted_at: Date;
}

const TermsAcceptanceSchema = new Schema<ITermsAcceptance>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    terms_type: {
      type: String,
      enum: ['listing_creation', 'rental_agreement', 'trade_agreement', 'account_signup'],
      required: true,
    },
    terms_version: {
      type: String,
      default: 'v1.0',
      required: true,
    },
    reference_id: {
      type: Schema.Types.ObjectId,
    },
    ip_address: {
      type: String,
    },
    accepted_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
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

export const TermsAcceptance = mongoose.model<ITermsAcceptance>(
  'TermsAcceptance',
  TermsAcceptanceSchema
);
