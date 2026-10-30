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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl h-[86vh] rounded-2xl bg-[#0b2821] border border-emerald-500/25 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-500/20 bg-[#0f3830] flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#0a2720] border border-emerald-500/30 font-mono text-xs font-bold text-emerald-300">
                {consultation.consultationNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[11px] font-bold uppercase text-emerald-200">
                {String(consultation.status || '').replace('_', ' ')}
              </span>
              <span className="text-xs text-emerald-100/70">
                📅 {consultation.preferredDate} • ⏰ {consultation.timeSlot}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>
                {consultation.expertName} &amp; {consultation.farmerName}
              </span>
            </h3>

            <p className="text-xs text-emerald-100/70 line-clamp-1">
              {consultation.affectedCrop && (
                <strong className="text-emerald-300 mr-1">
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
                className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-200 text-xs font-bold flex items-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Join video</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              type="button"
              onClick={() => fetchMessages(false)}
              className="p-1.5 rounded-full bg-[#0a2720] hover:bg-[#14473d] text-emerald-100/80 hover:text-white border border-emerald-500/20 cursor-pointer"
              title="Refresh messages"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-300' : ''}`}
              />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#0a2720] hover:bg-red-500/20 text-emerald-100/80 hover:text-red-200 border border-emerald-500/20 cursor-pointer"
              aria-label="Close consultation chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Privacy Notice Bar */}
        <div className="px-4 py-2 bg-[#09221b] border-b border-emerald-500/15 flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-100/70">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            Private consultation channel between farmer and verified expert.
          </span>
          <span className="font-medium text-emerald-100/50">
            {messages.length} message{messages.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#0a251e]">
          {loading ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-7 h-7 border-2 border-emerald-400/20 border-t-[#4de1b7] rounded-full animate-spin mx-auto" />
              <p className="text-xs text-emerald-200">
                Loading messages...
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-xl bg-[#0f3830] border border-emerald-500/20 p-6 text-center space-y-1.5 max-w-md mx-auto my-6">
              <MessageSquare className="w-8 h-8 text-emerald-400/60 mx-auto mb-1" />
              <h4 className="text-xs sm:text-sm font-bold text-white">
                Start the consultation discussion
              </h4>
              <p className="text-xs text-emerald-100/65 leading-relaxed">
                Send a question, record readings, or share close-up plant photos.
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
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 space-y-2 border ${
                      isDiagNote
                        ? 'bg-[#124235] border-emerald-400/40 text-emerald-100'
                        : isMine
                        ? 'bg-[#185344] border-emerald-400/30 text-white'
                        : 'bg-[#0f3830] border-emerald-500/20 text-white'
                    }`}
                  >
                    {/* Sender Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold">
                        {isExpertMsg ? (
                          <span className="text-emerald-300">
                            {msg.senderName} • Expert
                          </span>
                        ) : (
                          <span className="text-emerald-200">
                            {msg.senderName} • Farmer
                          </span>
                        )}

                        {isDiagNote && (
                          <span className="px-2 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                            Diagnostic note
                          </span>
                        )}
                      </div>

                      <span className="text-emerald-100/40 font-mono text-[10px]">
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
                        <div className="flex flex-wrap gap-2 pt-1">
                          {msg.attachments.map((imgUrl, idx) => (
                            <a
                              key={idx}
                              href={imgUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block w-20 h-20 rounded-xl overflow-hidden border border-emerald-500/30 hover:opacity-90"
                            >
                              <img
                                src={imgUrl}
                                alt={`Attachment ${idx + 1}`}
                                className="w-full h-full object-cover"
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
          className="p-3 sm:p-4 border-t border-emerald-500/20 bg-[#0f3830] space-y-2.5"
        >
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-400/30 text-red-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Prompt Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] text-emerald-100/50 font-bold uppercase shrink-0 mr-1">
              Quick:
            </span>
            {quickTemplates.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  setText((prev) => (prev ? `${prev} ${tpl}` : tpl))
                }
                className="shrink-0 px-2.5 py-1 rounded-full bg-[#0a2720] hover:bg-[#14473d] border border-emerald-500/20 text-[11px] text-emerald-100/80 hover:text-white cursor-pointer"
              >
                {tpl.slice(0, 45)}...
              </button>
            ))}
          </div>

          {/* Pending Image Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {attachments.map((src, idx) => (
                <div
                  key={idx}
                  className="relative w-14 h-14 rounded-lg overflow-hidden border border-emerald-500/30 bg-[#0a2720]"
                >
                  <img
                    src={src}
                    alt={`Upload preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(idx)}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Textarea & Send Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
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
                className="w-full px-3.5 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
              />

              {/* Attachment & Message Type Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3 py-1 rounded-full bg-[#0a2720] hover:bg-[#14473d] border border-emerald-500/25 text-xs font-semibold text-emerald-200 flex items-center gap-1.5 cursor-pointer">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Attach photo (≤2MB)</span>
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
                      placeholder="Or photo URL..."
                      className="px-2.5 py-1 rounded-full bg-[#0a2720] border border-emerald-500/25 text-xs text-white w-32 sm:w-40 placeholder:text-emerald-100/40"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-2.5 py-1 rounded-full bg-[#0a2720] hover:bg-[#14473d] border border-emerald-500/25 text-xs font-semibold text-white cursor-pointer"
                    >
                      + URL
                    </button>
                  </div>
                </div>

                {isAssignedExpert && (
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={messageType === 'diagnostic_note'}
                      onChange={(e) =>
                        setMessageType(
                          e.target.checked ? 'diagnostic_note' : 'text'
                        )
                      }
                      className="accent-[#4de1b7]"
                    />
                    <span>Diagnostic note</span>
                  </label>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="px-5 py-2.5 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Sending...' : 'Send'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultationChatModal;
