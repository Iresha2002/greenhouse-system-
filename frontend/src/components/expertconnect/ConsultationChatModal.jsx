import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Image as ImageIcon,
  RefreshCw,
  Video,
  Clock,
  ShieldCheck,
  Sprout,
  ExternalLink,
  AlertTriangle,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import {
  getConsultationMessages,
  sendConsultationMessage,
} from '../../services/api';

const MAX_ATTACHMENT_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const ConsultationChatModal = ({
  consultation,
  currentUser,
  onClose,
  onStatusUpdated,
}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [text, setText] = useState('');
  const [messageType, setMessageType] = useState('text'); // 'text' | 'diagnostic_note'
  const [attachments, setAttachments] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const messagesEndRef = useRef(null);

  const currentUserId = String(currentUser?._id || currentUser?.id || '');
  const isAssignedExpert =
    String(consultation?.expertUser || '') === currentUserId;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(
    async (silent = false) => {
      if (!consultation?._id) return;
      if (!silent) setLoading(true);
      try {
        const res = await getConsultationMessages(consultation._id);
        if (res && res.success) {
          setMessages(res.messages || []);
          setErrorMsg('');
        }
      } catch (err) {
        setErrorMsg(
          err?.response?.data?.error ||
            'Unable to load consultation message thread.'
        );
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [consultation?._id]
  );

  useEffect(() => {
    fetchMessages(false);
    // Poll every 8 seconds while modal is open for real-time updates
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setErrorMsg('');
    if (attachments.length + files.length > 3) {
      setErrorMsg('You can attach up to 3 images per message.');
      return;
    }

    files.forEach((file) => {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setErrorMsg(
          `Invalid file "${file.name}". Only JPEG, PNG, and WebP photos are allowed.`
        );
        return;
      }
      if (file.size > MAX_ATTACHMENT_SIZE) {
        setErrorMsg(`File "${file.name}" exceeds the 2 MB size limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAttachments((prev) =>
            prev.length < 3 ? [...prev, reader.result] : prev
          );
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      setErrorMsg('Please enter a valid http:// or https:// image URL.');
      return;
    }
    if (attachments.length >= 3) {
      setErrorMsg('Maximum 3 image attachments allowed per message.');
      return;
    }
    setAttachments((prev) => [...prev, trimmed]);
    setImageUrlInput('');
    setErrorMsg('');
  };

  const handleRemoveAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setErrorMsg('Please enter a message before sending.');
      return;
    }
    setSending(true);
    setErrorMsg('');
    try {
      const res = await sendConsultationMessage(consultation._id, {
        text: text.trim(),
        messageType: isAssignedExpert ? messageType : 'text',
        attachments,
      });
      if (res && res.success) {
        setText('');
        setAttachments([]);
        setMessageType('text');
        setMessages((prev) => [...prev, res.data]);
        if (
          res.consultationStatus &&
          res.consultationStatus !== consultation.status &&
          onStatusUpdated
        ) {
          onStatusUpdated();
        }
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.error || 'Failed to send consultation message.'
      );
    } finally {
      setSending(false);
    }
  };

  if (!consultation) return null;

  const quickTemplates = isAssignedExpert
    ? [
        'Initial observation: Please share your current reservoir EC (mS/cm) and pH readings.',
        'Could you attach a close-up photo of the underside of the affected leaves?',
        'Recommendation preview: Lower solution EC to 1.8 mS/cm and verify root-zone dissolved oxygen.',
      ]
    : [
        'Hello Doctor, our current EC is 2.2 mS/cm, pH is 6.1, and daytime greenhouse temperature is 31°C.',
        'I have attached close-up photographs of the affected leaves and stems.',
        'How soon should we apply the recommended treatment and flush the drip lines?',
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl h-[88vh] rounded-3xl bg-gradient-to-b from-[#0b2e2b] via-[#0d2730] to-[#081c24] border border-cyan-400/35 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-white/15 bg-black/30 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 border border-cyan-400/35 font-mono text-xs font-extrabold text-cyan-300">
                {consultation.consultationNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] font-extrabold uppercase text-emerald-300">
                Status: {String(consultation.status || '').replace('_', ' ')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-semibold text-white/80 flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-300" />
                {consultation.preferredDate} • {consultation.timeSlot}
              </span>
            </div>

            <h3 className="text-base sm:text-xl font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>
                Consultation Thread: {consultation.expertName} &amp;{' '}
                {consultation.farmerName}
              </span>
            </h3>

            <p className="text-xs text-white/70 line-clamp-1">
              {consultation.affectedCrop && (
                <strong className="text-emerald-300 mr-1.5">
                  [{consultation.affectedCrop}]
                </strong>
              )}
              {consultation.problemSummary}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {consultation.meetingLink && (
              <a
                href={consultation.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-extrabold flex items-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Join Video Room</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              type="button"
              onClick={() => fetchMessages(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white cursor-pointer"
              title="Refresh messages"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`}
              />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/30 text-white/80 hover:text-rose-200 cursor-pointer"
              aria-label="Close consultation chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Privacy Notice Bar */}
        <div className="px-5 py-2 bg-cyan-950/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-cyan-200/85">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            Private Encrypted Consultation Channel — Accessible only to the
            farmer ({consultation.farmerName}), assigned expert (
            {consultation.expertName}), and platform moderators.
          </span>
          <span className="font-semibold text-white/60">
            {messages.length} message{messages.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-cyan-300">
                Loading consultation messages...
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-8 text-center space-y-2 max-w-lg mx-auto my-6">
              <MessageSquare className="w-9 h-9 text-cyan-400/70 mx-auto" />
              <h4 className="text-sm font-extrabold text-white">
                Start the Agricultural Consultation Discussion
              </h4>
              <p className="text-xs text-white/65 leading-relaxed">
                Share greenhouse temperature/humidity logs, EC/pH readings, or
                upload close-up leaf/root photographs below to begin working
                through this crop problem together.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = String(msg.sender) === currentUserId;
              const isExpertMsg = msg.senderRole === 'expert';
              const isDiagNote = msg.messageType === 'diagnostic_note';

              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${
                    isMine ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-2.5 border ${
                      isDiagNote
                        ? 'bg-emerald-950/80 border-emerald-400/50 text-emerald-100'
                        : isMine
                        ? 'bg-cyan-500/20 border-cyan-400/40 text-white'
                        : 'bg-white/[0.08] border-white/15 text-white'
                    }`}
                  >
                    {/* Sender Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-[11px]">
                      <div className="flex items-center gap-1.5 font-extrabold">
                        {isExpertMsg ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/25 border border-emerald-400/40 text-emerald-300">
                            <Stethoscope className="w-3 h-3" />
                            {msg.senderName} • Verified Expert
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/30 text-cyan-200">
                            <Sprout className="w-3 h-3" />
                            {msg.senderName} • Farmer
                          </span>
                        )}

                        {isDiagNote && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/25 border border-amber-400/40 text-amber-300 uppercase text-[10px] font-black">
                            Diagnostic Note
                          </span>
                        )}
                      </div>

                      <span className="text-white/50 font-mono text-[10px]">
                        {new Date(msg.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Message Body */}
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>

                    {/* Image Attachments */}
                    {Array.isArray(msg.attachments) &&
                      msg.attachments.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                          {msg.attachments.map((imgUrl, idx) => (
                            <a
                              key={idx}
                              href={imgUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-xl overflow-hidden border border-white/20 bg-black/40 hover:border-cyan-400 transition-all"
                            >
                              <img
                                src={imgUrl}
                                alt={`Consultation attachment ${idx + 1}`}
                                className="w-full h-32 object-cover"
                              />
                            </a>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer Footer */}
        <form
          onSubmit={handleSend}
          className="p-4 sm:p-5 border-t border-white/15 bg-black/40 space-y-3"
        >
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Prompt Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] font-extrabold uppercase text-white/50 shrink-0 mr-1">
              Quick Prompts:
            </span>
            {quickTemplates.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  setText((prev) => (prev ? `${prev} ${tpl}` : tpl))
                }
                className="shrink-0 px-2.5 py-1 rounded-lg bg-white/[0.07] hover:bg-white/[0.14] border border-white/10 text-[11px] text-cyan-200 cursor-pointer transition-all"
              >
                {tpl.slice(0, 52)}...
              </button>
            ))}
          </div>

          {/* Pending Image Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {attachments.map((src, idx) => (
                <div
                  key={idx}
                  className="relative w-16 h-16 rounded-xl overflow-hidden border border-cyan-400/40 bg-black/40"
                >
                  <img
                    src={src}
                    alt={`Upload preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-rose-300 hover:text-rose-200 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Textarea & Send Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5">
            <div className="flex-1 space-y-2">
              <textarea
                rows={2}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  isAssignedExpert
                    ? 'Write diagnostic questions, observations, or treatment instructions for the farmer...'
                    : 'Describe crop symptoms, EC/pH readings, or ask your assigned expert a question...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
              />

              {/* Attachment & Message Type Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-cyan-200 flex items-center gap-1.5 cursor-pointer">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Attach Photo (≤2MB)</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center gap-1">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Or paste photo URL..."
                      className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/15 text-xs text-white w-36 sm:w-44"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer"
                    >
                      + URL
                    </button>
                  </div>
                </div>

                {isAssignedExpert && (
                  <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={messageType === 'diagnostic_note'}
                      onChange={(e) =>
                        setMessageType(
                          e.target.checked ? 'diagnostic_note' : 'text'
                        )
                      }
                      className="accent-emerald-400"
                    />
                    <span>Highlight as Official Diagnostic Note</span>
                  </label>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="px-5 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>{sending ? 'Sending...' : 'Send Message'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultationChatModal;
