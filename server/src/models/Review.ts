import mongoose, { Schema, Document, Types } from 'mongoose';
import { User } from './User';

export interface IReview extends Document {
  reviewer_id: Types.ObjectId;
  target_user_id: Types.ObjectId;
  listing_id?: Types.ObjectId;
  rating: number;
  comment: string;
  created_at: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    reviewer_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    target_user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    listing_id: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500,
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

ReviewSchema.index(
  { reviewer_id: 1, listing_id: 1 },
  { unique: true, partialFilterExpression: { listing_id: { $exists: true } } }
);

ReviewSchema.pre('validate', function (next) {
  if (
    this.reviewer_id &&
    this.target_user_id &&
    String(this.reviewer_id) === String(this.target_user_id)
  ) {
    return next(new Error('You cannot submit a review for your own profile or listing.'));
  }
  next();
});

export async function recalculateUserRating(targetUserId: Types.ObjectId | string) {
  const stats = await mongoose.model<IReview>('Review').aggregate([
    { $match: { target_user_id: new mongoose.Types.ObjectId(String(targetUserId)) } },
    {
      $group: {
        _id: '$target_user_id',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(targetUserId, {
      rating: Math.round(stats[0].avgRating * 100) / 100,
      review_count: stats[0].count,
    });
  } else {
    await User.findByIdAndUpdate(targetUserId, {
      rating: 5.0,
      review_count: 0,
    });
  }
}

ReviewSchema.post('save', async function () {
  await recalculateUserRating(this.target_user_id);
});

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
