import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRentalRequest extends Document {
  listing_id: Types.ObjectId;
  renter_id: Types.ObjectId;
  owner_id: Types.ObjectId;
  start_date: string;
  end_date: string;
  duration_type: 'Hourly' | 'Daily' | 'Weekly';
  duration_units: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  message: string;
  terms_accepted: boolean;
  terms_accepted_at?: Date;
  terms_version: string;
  created_at: Date;
  updated_at: Date;
}

const RentalRequestSchema = new Schema<IRentalRequest>(
  {
    listing_id: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    renter_id: {
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
    start_date: { type: String, required: true },
    end_date: { type: String, required: true },
    duration_type: {
      type: String,
      enum: ['Hourly', 'Daily', 'Weekly'],
      required: true,
    },
    duration_units: { type: Number, default: 1, min: 1 },
    total_amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    message: { type: String, default: '', maxlength: 1000 },
    terms_accepted: { type: Boolean, default: false },
    terms_accepted_at: { type: Date },
    terms_version: { type: String, default: 'v1.0' },
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

RentalRequestSchema.pre('validate', function (next) {
  if (this.renter_id && this.owner_id && String(this.renter_id) === String(this.owner_id)) {
    return next(new Error('You cannot request to rent your own listing.'));
  }
  next();
});

export const RentalRequest = mongoose.model<IRentalRequest>('RentalRequest', RentalRequestSchema);
