import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITradeOffer extends Document {
  listing_id: Types.ObjectId;
  requester_id: Types.ObjectId;
  owner_id: Types.ObjectId;
  offered_item_title: string;
  offered_item_description: string;
  offered_item_image?: string;
  offered_item_value: number;
  cash_adjustment: number;
  status: 'pending' | 'negotiating' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  negotiation_notes?: string;
  terms_accepted: boolean;
  terms_accepted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const TradeOfferSchema = new Schema<ITradeOffer>(
  {
    listing_id: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    requester_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    owner_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    offered_item_title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    offered_item_description: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    offered_item_image: { type: String },
    offered_item_value: { type: Number, required: true, min: 0 },
    cash_adjustment: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'negotiating', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    negotiation_notes: { type: String, maxlength: 1000 },
    terms_accepted: { type: Boolean, default: false },
    terms_accepted_at: { type: Date },
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

TradeOfferSchema.pre('validate', function (next) {
  if (this.requester_id && this.owner_id && String(this.requester_id) === String(this.owner_id)) {
    return next(new Error('You cannot submit a trade offer on your own listing.'));
  }
  next();
});

export const TradeOffer = mongoose.model<ITradeOffer>('TradeOffer', TradeOfferSchema);
