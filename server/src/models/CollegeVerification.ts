import mongoose, { Schema, Document, Types } from 'mongoose';
import { CollegeVerificationStatus } from './User';

export interface ICollegeVerification extends Document {
  user_id: Types.ObjectId;
  college_name: string;
  college_id_number: string;
  college_id_image_url?: string;
  cloudinary_public_id?: string;
  verification_status: CollegeVerificationStatus;
  rejection_reason?: string;
  submitted_at?: Date;
  reviewed_at?: Date;
  reviewed_by?: Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const CollegeVerificationSchema = new Schema<ICollegeVerification>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    college_name: {
      type: String,
      required: true,
      default: 'Chitkara University',
      trim: true,
      maxlength: 150,
    },
    college_id_number: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    college_id_image_url: {
      type: String,
    },
    cloudinary_public_id: {
      type: String,
    },
    verification_status: {
      type: String,
      enum: ['Not Submitted', 'Pending Verification', 'Verified', 'Rejected'],
      default: 'Not Submitted',
    },
    rejection_reason: {
      type: String,
      maxlength: 500,
    },
    submitted_at: {
      type: Date,
    },
    reviewed_at: {
      type: Date,
    },
    reviewed_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

export const CollegeVerification = mongoose.model<ICollegeVerification>(
  'CollegeVerification',
  CollegeVerificationSchema
);
