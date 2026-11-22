import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { RentalRequest } from '../models/RentalRequest';
import { TradeOffer } from '../models/TradeOffer';
import { User } from '../models/User';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { SAFE_PUBLIC_USER_FIELDS } from './users';
import { emitToUsers } from '../socket';

const router = Router();

const formatConversation = (doc: any) => {
  const json = typeof doc.toJSON === 'function' ? doc.toJSON() : { ...doc, id: String(doc._id) };

  if (json.listing_id && typeof json.listing_id === 'object' && json.listing_id._id) {
    json.listing = {
      id: String(json.listing_id._id),
      title: json.listing_id.title,
      listing_type: json.listing_id.listing_type,
      user_id: String(json.listing_id.user_id),
    };
    json.listing_id = String(json.listing_id._id);
  } else if (json.listing_id) {
    json.listing_id = String(json.listing_id);
  }

  if (json.participant1_id && typeof json.participant1_id === 'object' && json.participant1_id._id) {
    const p1 = json.participant1_id;
    json.participant1 = {
      id: String(p1._id),
      full_name: p1.full_name,
      avatar_url: p1.avatar_url,
      college_name: p1.college_name,
      college_verification_status: p1.college_verification_status,
    };
    json.participant1_id = String(p1._id);
  } else if (json.participant1_id) {
    json.participant1_id = String(json.participant1_id);
  }

  if (json.participant2_id && typeof json.participant2_id === 'object' && json.participant2_id._id) {
    const p2 = json.participant2_id;
    json.participant2 = {
      id: String(p2._id),
      full_name: p2.full_name,
      avatar_url: p2.avatar_url,
      college_name: p2.college_name,
      college_verification_status: p2.college_verification_status,
    };
    json.participant2_id = String(p2._id);
  } else if (json.participant2_id) {
    json.participant2_id = String(json.participant2_id);
  }

  json.unread_count = json.unread_count || 0;
  return json;
};

const formatMessage = (doc: any) => {
  const json = typeof doc.toJSON === 'function' ? doc.toJSON() : { ...doc, id: String(doc._id) };
  json.conversation_id = String(json.conversation_id?._id || json.conversation_id);
  json.sender_id = String(json.sender_id?._id || json.sender_id);
  return json;
};

// GET /api/conversations
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.userId);
    const convDocs = await Conversation.find({
      $or: [{ participant1_id: uid }, { participant2_id: uid }],
    })
      .populate('listing_id', 'title listing_type user_id')
      .populate('participant1_id', SAFE_PUBLIC_USER_FIELDS)
      .populate('participant2_id', SAFE_PUBLIC_USER_FIELDS)
      .sort({ last_message_at: -1 });

    const conversations = convDocs.map(formatConversation);
    const convIds = convDocs.map((c) => c._id);

    const msgDocs =
      convIds.length > 0
        ? await Message.find({ conversation_id: { $in: convIds } }).sort({ created_at: 1 })
        : [];

    const messages: Record<string, any[]> = {};
    for (const m of msgDocs) {
      const formatted = formatMessage(m);
      if (!messages[formatted.conversation_id]) {
        messages[formatted.conversation_id] = [];
      }
      messages[formatted.conversation_id].push(formatted);
    }

    res.json({ conversations, messages });
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ error: 'Failed to load conversations.' });
  }
});

// POST /api/conversations (Start or retrieve conversation)
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { listingId, targetUserId, subject } = req.body || {};
    const currentUserId = req.userId!;

    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      res.status(400).json({ error: 'Valid target user ID is required.' });
      return;
    }

    if (String(targetUserId) === currentUserId) {
      res.status(400).json({ error: 'You cannot start a conversation with yourself.' });
      return;
    }

    const u1 = new mongoose.Types.ObjectId(currentUserId);
    const u2 = new mongoose.Types.ObjectId(targetUserId);

    let conv = await Conversation.findOne({
      $or: [
        { participant1_id: u1, participant2_id: u2 },
        { participant1_id: u2, participant2_id: u1 },
      ],
    })
      .populate('listing_id', 'title listing_type user_id')
      .populate('participant1_id', SAFE_PUBLIC_USER_FIELDS)
      .populate('participant2_id', SAFE_PUBLIC_USER_FIELDS);

    if (!conv) {
      const validListingId =
        listingId && mongoose.Types.ObjectId.isValid(listingId)
          ? new mongoose.Types.ObjectId(listingId)
          : undefined;

      const created = await Conversation.create({
        listing_id: validListingId,
        participant1_id: u1,
        participant2_id: u2,
        subject: typeof subject === 'string' && subject.trim() ? subject.trim() : 'Inquiry',
        last_message_text: 'Started conversation',
        last_message_at: new Date(),
      });

      conv = await Conversation.findById(created._id)
        .populate('listing_id', 'title listing_type user_id')
        .populate('participant1_id', SAFE_PUBLIC_USER_FIELDS)
        .populate('participant2_id', SAFE_PUBLIC_USER_FIELDS);
    }

    const formatted = formatConversation(conv);
    res.json({ conversation: formatted });
  } catch (err: any) {
    console.error('Start conversation error:', err);
    res.status(400).json({ error: err?.message || 'Failed to start conversation.' });
  }
});

// POST /api/conversations/:id/messages
router.post('/:id/messages', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const convId = String(req.params.id);
    const { content, message_type, metadata } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(convId)) {
      res.status(404).json({ error: 'Conversation not found.' });
      return;
    }
    if (!content || typeof content !== 'string' || !content.trim()) {
      res.status(400).json({ error: 'Message content cannot be empty.' });
      return;
    }

    const conv = await Conversation.findById(convId);
    if (!conv) {
      res.status(404).json({ error: 'Conversation not found.' });
      return;
    }

    const isP1 = String(conv.participant1_id) === req.userId;
    const isP2 = String(conv.participant2_id) === req.userId;
    if (!isP1 && !isP2) {
      res.status(403).json({ error: 'Forbidden: You are not a participant in this conversation.' });
      return;
    }

    const validType = ['text', 'rental_offer', 'trade_offer', 'system'].includes(message_type)
      ? message_type
      : 'text';

    const createdMsg = await Message.create({
      conversation_id: conv._id,
      sender_id: req.userId,
      content: content.trim(),
      message_type: validType,
      metadata: metadata || {},
      is_read: false,
    });

    conv.last_message_text = content.trim();
    conv.last_message_at = createdMsg.created_at;
    await conv.save();

    const formattedMsg = formatMessage(createdMsg);
    emitToUsers(
      [String(conv.participant1_id), String(conv.participant2_id)],
      'new_message',
      formattedMsg
    );

    res.status(201).json({ message: formattedMsg });
  } catch (err: any) {
    console.error('Send message error:', err);
    res.status(400).json({ error: err?.message || 'Failed to send message.' });
  }
});

// POST /api/conversations/:id/confirm-deal (Seller confirms rental or trade in chat)
router.post('/:id/confirm-deal', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const convId = String(req.params.id);
    const { dealType, notes } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(convId)) {
      res.status(404).json({ error: 'Conversation not found.' });
      return;
    }

    const conv = await Conversation.findById(convId);
    if (!conv) {
      res.status(404).json({ error: 'Conversation not found.' });
      return;
    }

    const isParticipant =
      String(conv.participant1_id) === req.userId ||
      String(conv.participant2_id) === req.userId;
    if (!isParticipant) {
      res.status(403).json({ error: 'Forbidden: You are not a participant in this conversation.' });
      return;
    }

    const currentUser = await User.findById(req.userId).select('full_name');
    const ownerName = currentUser?.full_name || 'Owner';

    if (dealType === 'rental' && conv.listing_id) {
      await RentalRequest.updateMany(
        { listing_id: conv.listing_id, owner_id: req.userId, status: 'pending' },
        { $set: { status: 'approved' } }
      );
    } else if (dealType === 'trade' && conv.listing_id) {
      await TradeOffer.updateMany(
        { listing_id: conv.listing_id, owner_id: req.userId, status: 'pending' },
        { $set: { status: 'accepted' } }
      );
    }

    await Message.updateMany(
      {
        conversation_id: conv._id,
        message_type: { $in: ['rental_offer', 'trade_offer'] },
      },
      { $set: { 'metadata.status': 'approved' } }
    );

    const confirmText =
      dealType === 'rental'
        ? `🎉 [RENTAL CONFIRMED & APPROVED] ${ownerName} has officially approved this rental reservation! ${notes ? `Notes: ${notes}` : 'Arranging meetup & handover.'}`
        : `🤝 [TRADE DEAL CONFIRMED] ${ownerName} has accepted and finalized this trade exchange! ${notes ? `Notes: ${notes}` : 'Handover & cash offset confirmed.'}`;

    const createdMsg = await Message.create({
      conversation_id: conv._id,
      sender_id: req.userId,
      content: confirmText,
      message_type: 'system',
      metadata: {
        action: 'deal_confirmed',
        dealType,
        confirmedAt: new Date().toISOString(),
        confirmedBy: ownerName,
      },
      is_read: false,
    });

    conv.last_message_text = `Deal confirmed by ${ownerName}`;
    conv.last_message_at = createdMsg.created_at;
    await conv.save();

    const formattedMsg = formatMessage(createdMsg);
    emitToUsers(
      [String(conv.participant1_id), String(conv.participant2_id)],
      'new_message',
      formattedMsg
    );

    res.json({ message: formattedMsg });
  } catch (err: any) {
    console.error('Confirm deal in chat error:', err);
    res.status(400).json({ error: err?.message || 'Failed to confirm deal.' });
  }
});

export default router;
