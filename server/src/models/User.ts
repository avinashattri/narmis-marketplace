import mongoose, { Schema, Document } from 'mongoose';

export type CollegeVerificationStatus =
  | 'Not Submitted'
  | 'Pending Verification'
  | 'Verified'
  | 'Rejected';

export interface IUser extends Document {
  full_name: string;
  email: string;
  password_hash: string;
  avatar_url: string;
  bio: string;
  location: string;
  college_name: string;
  college_verification_status: CollegeVerificationStatus;
  college_verified_at?: Date;
  rating: number;
  review_count: number;
  email_verified: boolean;
  email_verification_token_hash?: string;
  reset_password_token_hash?: string;
  reset_password_expires?: Date;
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new Schema<IUser>(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password_hash: {
      type: String,
      required: true,
      select: false,
    },
    avatar_url: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: 'Member of NARMIS circular community.',
      maxlength: 500,
    },
    location: {
      type: String,
      default: 'Chitkara University, Rajpura, Punjab, India',
      trim: true,
      maxlength: 200,
    },
    college_name: {
      type: String,
      default: 'Chitkara University',
      trim: true,
      maxlength: 150,
    },
    college_verification_status: {
      type: String,
      enum: ['Not Submitted', 'Pending Verification', 'Verified', 'Rejected'],
      default: 'Not Submitted',
    },
    college_verified_at: {
      type: Date,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    review_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    email_verified: {
      type: Boolean,
      default: true,
    },
    email_verification_token_hash: {
      type: String,
      select: false,
    },
    reset_password_token_hash: {
      type: String,
      select: false,
    },
    reset_password_expires: {
      type: Date,
      select: false,
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
        delete ret.password_hash;
        delete ret.reset_password_token_hash;
        delete ret.reset_password_expires;
        delete ret.email_verification_token_hash;
        return ret;
      },
    },
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
