import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  listing_id?: Types.ObjectId;
  participant1_id: Types.ObjectId;
  participant2_id: Types.ObjectId;
  subject?: string;
  last_message_text?: string;
  last_message_at: Date;
  created_at: Date;
  updated_at: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    listing_id: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
    },
    participant1_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    participant2_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      maxlength: 250,
    },
    last_message_text: {
      type: String,
      default: 'Started conversation',
      maxlength: 1000,
    },
    last_message_at: {
      type: Date,
      default: Date.now,
      index: true,
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

ConversationSchema.pre('validate', function (next) {
  if (
    this.participant1_id &&
    this.participant2_id &&
    String(this.participant1_id) === String(this.participant2_id)
  ) {
    return next(new Error('Conversation participants must be two distinct users.'));
  }
  next();
});

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
