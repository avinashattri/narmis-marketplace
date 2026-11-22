import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISavedListing extends Document {
  user_id: Types.ObjectId;
  listing_id: Types.ObjectId;
  created_at: Date;
}

const SavedListingSchema = new Schema<ISavedListing>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    listing_id: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
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

SavedListingSchema.index({ user_id: 1, listing_id: 1 }, { unique: true });

export const SavedListing = mongoose.model<ISavedListing>('SavedListing', SavedListingSchema);
