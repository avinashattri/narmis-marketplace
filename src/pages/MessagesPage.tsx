import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Send,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Repeat,
  ShoppingBag,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  Check,
  CheckCheck,
  CheckCircle2,
  Handshake,
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    confirmDealInChat,
  } = useMarketplace();
  const { user, isSupabaseConnected } = useAuth();

  const [inputMessage, setInputMessage] = useState('');
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [dealNote, setDealNote] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState<'rental' | 'trade' | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConversationId) return;

    sendMessage(activeConversationId, inputMessage.trim(), 'text');
    setInputMessage('');
  };

  const getPartner = (conv: typeof activeConversation) => {
    if (!conv) return null;
    return conv.participant1_id === user?.id ? conv.participant2 : conv.participant1;
  };

  const partner = getPartner(activeConversation);

  return (
    <div className="pt-24 pb-12 bg-narmis-bg min-h-screen text-narmis-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Chat Mode Notice Banner */}
        <div className="mb-4 flex items-center justify-between p-3 rounded-2xl bg-narmis-surface border border-narmis-mountain/50 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="font-semibold text-narmis-parchment">
              {isSupabaseConnected
                ? 'Supabase Realtime Channel Connected'
                : 'Demo P2P Messaging (Hackathon Test Mode - Reactive Store)'}
            </span>
          </div>
          <span className="text-[11px] text-narmis-cream/60 hidden sm:inline">
            Direct peer discussions for Rent, Trade, and Purchase negotiations
          </span>
        </div>

        {/* 2-Panel Chat Container */}
        <div className="bg-narmis-surface rounded-3xl border border-narmis-mountain/60 shadow-2xl overflow-hidden h-[75vh] flex">
          {/* Left Panel: Conversations List */}
          <div
            className={`w-full lg:w-80 xl:w-96 border-r border-narmis-mountain/50 flex flex-col bg-narmis-surface ${
              !isMobileListVisible ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Conversations Header */}
            <div className="p-4 border-b border-narmis-mountain/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-narmis-gold" />
                <h2 className="font-serif text-lg font-bold text-narmis-parchment">
                  Messages
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-narmis-mountain text-[10px] font-semibold text-narmis-parchment">
                {conversations.length} Active
              </span>
            </div>

            {/* Conversation Threads Scroll List */}
            <div className="flex-1 overflow-y-auto divide-y divide-narmis-mountain/20">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-narmis-cream/60 space-y-2">
                  <p>No conversations yet.</p>
                  <p>Click "Chat with Owner" on any marketplace listing to begin an inquiry!</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const threadPartner = conv.participant1_id === user?.id ? conv.participant2 : conv.participant1;
                  const isActive = conv.id === activeConversationId;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setActiveConversationId(conv.id);
                        setIsMobileListVisible(false);
                      }}
                      className={`w-full p-4 text-left transition-colors flex items-start gap-3 ${
                        isActive
                          ? 'bg-narmis-mountain/50 border-l-4 border-narmis-gold'
                          : 'hover:bg-narmis-mountain/20'
                      }`}
                    >
                      <img
                        src={threadPartner?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={threadPartner?.full_name || 'User'}
                        className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-narmis-mountain"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-narmis-parchment truncate">
                            {threadPartner?.full_name || 'Marketplace Member'}
                          </h4>
                          <span className="text-[10px] text-narmis-cream/50 shrink-0">
                            {new Date(conv.last_message_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {conv.subject && (
                          <p className="text-[11px] font-medium text-narmis-gold truncate mt-0.5">
                            {conv.subject}
                          </p>
                        )}

                        <p className="text-xs text-narmis-cream/70 truncate mt-1">
                          {conv.last_message_text || 'Start chatting...'}
                        </p>
                      </div>

                      {conv.unread_count && conv.unread_count > 0 ? (
                        <span className="w-2 h-2 rounded-full bg-narmis-terracotta shrink-0 mt-2" />
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Active Conversation Window */}
          <div
            className={`flex-1 flex flex-col bg-narmis-forestDark/40 ${
              isMobileListVisible ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {activeConversation ? (
              <>
                {/* Active Chat Header */}
                <div className="p-4 border-b border-narmis-mountain/50 bg-narmis-surface/90 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsMobileListVisible(true)}
                      className="lg:hidden p-1 rounded-lg text-narmis-cream hover:bg-narmis-mountain"
                      aria-label="Back to conversations list"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <img
                      src={partner?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={partner?.full_name || 'Partner'}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-narmis-gold"
                    />

                    <div>
                      <h3 className="text-sm font-bold text-narmis-parchment">
                        {partner?.full_name || 'Marketplace Member'}
                      </h3>
                      <p className="text-[11px] text-narmis-cream/60 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Online</span>
                        {partner?.location && (
                          <>
                            <span>·</span>
                            <span>{partner.location}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Linked Product Header Banner */}
                  {activeConversation.listing && (
                    <Link
                      to={`/product/${activeConversation.listing.id}`}
                      className="hidden sm:flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-xl bg-narmis-mountain/40 hover:bg-narmis-mountain border border-narmis-mountain/60 transition-colors text-right"
                    >
                      <img
                        src={activeConversation.listing.images[0]}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-[11px] font-bold text-narmis-parchment max-w-[150px] truncate">
                          {activeConversation.listing.title}
                        </p>
                        <p className="text-[10px] text-narmis-gold font-semibold uppercase">
                          {activeConversation.listing.listing_type}
                        </p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-narmis-cream/50 ml-1" />
                    </Link>
                  )}
                </div>

                {/* Deal Action Header Bar: Rental & Trade Confirmation */}
                {activeConversation.listing && (
                  <div className="px-4 py-2.5 bg-narmis-mountain/30 border-b border-narmis-mountain/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-narmis-parchment font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-narmis-gold" />
                      <span>Negotiating: <strong className="text-narmis-gold uppercase">{activeConversation.listing.listing_type}</strong> terms</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeConversation.listing.listing_type === 'rent' ? (
                        <button
                          type="button"
                          onClick={() => {
                            confirmDealInChat(
                              activeConversation.id,
                              'rental',
                              `Agreed to rental for ${activeConversation.listing?.title}`
                            );
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Seller: Confirm Rental</span>
                        </button>
                      ) : activeConversation.listing.listing_type === 'trade' ? (
                        <button
                          type="button"
                          onClick={() => {
                            confirmDealInChat(
                              activeConversation.id,
                              'trade',
                              `Accepted trade exchange for ${activeConversation.listing?.title}`
                            );
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow"
                        >
                          <Handshake className="w-3.5 h-3.5" />
                          <span>Seller: Confirm Trade</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            confirmDealInChat(
                              activeConversation.id,
                              'rental',
                              `Confirmed purchase and handover for ${activeConversation.listing?.title}`
                            );
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Seller: Confirm Handover</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {/* Safety Watermark */}
                  <div className="text-center py-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-narmis-surface border border-narmis-mountain/50 text-[10px] text-narmis-cream/70">
                      <ShieldCheck className="w-3.5 h-3.5 text-narmis-gold" />
                      <span>Always coordinate meetups in safe, public places.</span>
                    </span>
                  </div>

                  {activeMessages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;

                    if (msg.message_type === 'system') {
                      return (
                        <div
                          key={msg.id}
                          className="w-full my-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-narmis-surface to-emerald-950/80 border border-emerald-500/50 shadow-lg text-center space-y-1 animate-fadeIn"
                        >
                          <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Deal Formally Confirmed</span>
                          </div>
                          <p className="text-xs text-narmis-parchment font-medium">{msg.content}</p>
                          <span className="text-[10px] text-narmis-cream/50 block">Verified on NARMIS P2P Ledger</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        {/* Interactive message card for trade / rental offers */}
                        {msg.message_type === 'trade_offer' && msg.metadata && (
                          <div className="mb-1.5 max-w-sm rounded-2xl p-4 bg-amber-950/60 border border-amber-500/60 shadow-lg text-xs space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-amber-300 font-bold uppercase tracking-wider">
                                <Repeat className="w-4 h-4" />
                                <span>Trade Offer Proposal</span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  msg.metadata.status === 'approved'
                                    ? 'bg-emerald-500 text-narmis-charcoal'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                                }`}
                              >
                                {msg.metadata.status === 'approved' ? '✓ Approved & Confirmed' : 'Pending Review'}
                              </span>
                            </div>

                            <p className="text-narmis-parchment font-semibold">
                              Item: {msg.metadata.offeredItem}
                            </p>

                            <div className="flex justify-between text-narmis-cream/80">
                              <span>Est. Value: ₹{msg.metadata.estimatedValue}</span>
                              <span className="text-amber-300 font-bold">
                                {msg.metadata.cashAdjustment > 0
                                  ? `+₹${msg.metadata.cashAdjustment} Cash`
                                  : 'Even Trade'}
                              </span>
                            </div>

                            {msg.metadata.status !== 'approved' && (
                              <button
                                type="button"
                                onClick={() =>
                                  confirmDealInChat(
                                    activeConversation.id,
                                    'trade',
                                    `Accepted trade offer for ${msg.metadata?.offeredItem}`
                                  )
                                }
                                className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-narmis-charcoal font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md mt-1"
                              >
                                <Handshake className="w-3.5 h-3.5" />
                                <span>Seller Action: Confirm & Accept Trade</span>
                              </button>
                            )}
                          </div>
                        )}

                        {msg.message_type === 'rental_offer' && msg.metadata && (
                          <div className="mb-1.5 max-w-sm rounded-2xl p-4 bg-sky-950/60 border border-sky-500/60 shadow-lg text-xs space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-sky-300 font-bold uppercase tracking-wider">
                                <Calendar className="w-4 h-4" />
                                <span>Rental Reservation</span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  msg.metadata.status === 'approved'
                                    ? 'bg-emerald-500 text-narmis-charcoal'
                                    : 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                                }`}
                              >
                                {msg.metadata.status === 'approved' ? '✓ Approved & Confirmed' : 'Pending Approval'}
                              </span>
                            </div>

                            <p className="text-narmis-parchment font-semibold text-sm">
                              Total: ₹{msg.metadata.totalAmount}
                            </p>
                            <p className="text-[11px] text-narmis-cream/70">
                              Dates: {msg.metadata.startDate} → {msg.metadata.endDate} ({msg.metadata.durationUnits || 2} {msg.metadata.durationType || 'Daily'})
                            </p>

                            {msg.metadata.status !== 'approved' && (
                              <button
                                type="button"
                                onClick={() =>
                                  confirmDealInChat(
                                    activeConversation.id,
                                    'rental',
                                    `Confirmed booking for ₹${msg.metadata?.totalAmount}`
                                  )
                                }
                                className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-narmis-charcoal font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md mt-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Seller Action: Confirm & Approve Rental</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Standard Message Bubble */}
                        <div
                          className={`max-w-sm sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                            isMe
                              ? 'bg-narmis-gold text-narmis-charcoal font-medium rounded-br-sm'
                              : 'bg-narmis-surface text-narmis-cream border border-narmis-mountain/50 rounded-bl-sm'
                          }`}
                        >
                          {msg.content}
                        </div>

                        {/* Message Timestamp */}
                        <span className="text-[10px] text-narmis-cream/40 mt-1 px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 sm:p-4 border-t border-narmis-mountain/50 bg-narmis-surface flex items-center gap-2 sm:gap-3"
                >
                  <input
                    type="text"
                    placeholder="Type a message or trade negotiation proposal..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-2xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs sm:text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold transition-colors"
                  />

                  {activeConversation.listing && (
                    <button
                      type="button"
                      onClick={() => {
                        const note = prompt('Enter confirmation details (e.g. Meetup place or time):', 'Confirmed for Koramangala meetup');
                        if (note) {
                          confirmDealInChat(
                            activeConversation.id,
                            activeConversation.listing?.listing_type === 'trade' ? 'trade' : 'rental',
                            note
                          );
                        }
                      }}
                      className="px-3 sm:px-4 py-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500 hover:text-narmis-charcoal text-emerald-400 border border-emerald-500/40 text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                      title="Quick Confirm Deal"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Confirm Deal</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    className="p-3 rounded-2xl bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal font-bold transition-all shadow-md hover:scale-105 active:scale-95 shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-narmis-cream/60">
                <MessageSquare className="w-12 h-12 text-narmis-gold/40 mb-3" />
                <h3 className="font-serif text-xl font-bold text-narmis-parchment">
                  Select a Conversation
                </h3>
                <p className="text-xs max-w-xs mt-1">
                  Choose a thread on the left to discuss rental terms, negotiate trades, or ask questions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
