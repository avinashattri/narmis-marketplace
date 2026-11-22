import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPurchase extends Document {
  listing_id: Types.ObjectId;
  buyer_id: Types.ObjectId;
  seller_id: Types.ObjectId;
  amount: number;
  status: 'payment_submitted' | 'pending' | 'completed' | 'refunded' | 'cancelled';
  payment_method: string;
  payment_reference?: string;
  payment_confirmed_by_buyer: boolean;
  payment_confirmed_at?: Date;
  payment_verification_status: 'Awaiting Payment' | 'Payment Submitted' | 'Verified' | 'Cancelled';
  receipt_number: string;
  shipping_address: string;
  created_at: Date;
  updated_at: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    listing_id: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    buyer_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    seller_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['payment_submitted', 'pending', 'completed', 'refunded', 'cancelled'],
      default: 'payment_submitted',
    },
    payment_method: {
      type: String,
      default: 'UPI QR Payment',
    },
    payment_reference: {
      type: String,
      maxlength: 100,
    },
    payment_confirmed_by_buyer: {
      type: Boolean,
      default: false,
    },
    payment_confirmed_at: {
      type: Date,
    },
    payment_verification_status: {
      type: String,
      enum: ['Awaiting Payment', 'Payment Submitted', 'Verified', 'Cancelled'],
      default: 'Payment Submitted',
    },
    receipt_number: {
      type: String,
      required: true,
      unique: true,
    },
    shipping_address: {
      type: String,
      required: true,
      maxlength: 500,
    },
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

PurchaseSchema.pre('validate', function (next) {
  if (this.buyer_id && this.seller_id && String(this.buyer_id) === String(this.seller_id)) {
    return next(new Error('You cannot purchase your own listing.'));
  }
  next();
});

export const Purchase = mongoose.model<IPurchase>('Purchase', PurchaseSchema);
