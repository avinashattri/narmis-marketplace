import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  conversation_id: Types.ObjectId;
  sender_id: Types.ObjectId;
  content: string;
  message_type: 'text' | 'rental_offer' | 'trade_offer' | 'system';
  metadata: Record<string, any>;
  is_read: boolean;
  created_at: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversation_id: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    message_type: {
      type: String,
      enum: ['text', 'rental_offer', 'trade_offer', 'system'],
      default: 'text',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    is_read: {
      type: Boolean,
      default: false,
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

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
