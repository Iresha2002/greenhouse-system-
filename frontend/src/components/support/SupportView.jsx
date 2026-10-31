import React, { useState, useMemo } from 'react';
import {
  LifeBuoy,
  Search,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Cpu,
  ShoppingBag,
  Package,
  Sparkles,
  ArrowLeft,
  Send,
  ShieldCheck,
  Activity,
  FileText,
  HelpCircle,
  X,
  ExternalLink,
} from 'lucide-react';

const FAQ_DATA = [
  {
    id: 'faq-1',
    category: 'sensors',
    question: 'How do I calibrate soil moisture and electrical conductivity (EC) sensors?',
    answer:
      'To calibrate SmartGrow analog or digital soil sensors: 1) Thoroughly clean the sensor probes with distilled water. 2) Submerge in 1.413 mS/cm standard EC calibration solution. 3) Open your Smart Greenhouse dashboard, click on the sensor node settings, and select "Recalibrate Probe". Calibration offsets will automatically synchronize to your IoT gateway within 30 seconds.',
  },
  {
    id: 'faq-2',
    category: 'sensors',
    question: 'What should I do if a greenhouse sensor node shows "Offline"?',
    answer:
      'Check the solar charging or 12V DC power connection first. If power is verified, ensure your LoRa/WiFi gateway is within 150m line-of-sight. Press and hold the reset pin on the ESP32 transmitter node for 5 seconds until the status LED blinks green. Telemetry should resume transmitting within 1 minute.',
  },
  {
    id: 'faq-3',
    category: 'marketplace',
    question: 'How does escrow protection and payout work for crop sales?',
    answer:
      'When a customer places a crop order, payment is secured in SmartGrow Escrow. Once the farmer dispatches the harvest and the customer or courier confirms physical delivery, funds are automatically released to the farmer’s registered bank account within 24 business hours.',
  },
  {
    id: 'faq-4',
    category: 'marketplace',
    question: 'Can I cancel an order or report damaged produce upon delivery?',
    answer:
      'Customers can cancel pending orders before dispatch directly from "My Crop Orders". If produce arrives damaged or fails organic quality checks, submit a ticket within 6 hours of delivery with photo evidence for an instant full refund or replacement guarantee.',
  },
  {
    id: 'faq-5',
    category: 'suppliers',
    question: 'What is the delivery timeline and warranty on irrigation valves and IoT gear?',
    answer:
      'All calibrated solenoids, pumps, and sensor modules ship within 24 to 48 hours via Agri Courier across all agricultural zones. Hardware components carry a 1-year manufacturer replacement warranty against moisture ingress and electronic defects.',
  },
  {
    id: 'faq-6',
    category: 'expertconnect',
    question: 'How do I schedule an on-site greenhouse consultation with an agronomist?',
    answer:
      'Visit the ExpertConnect tab, browse verified agronomists by crop specialization (e.g. Hydroponics, Pest Management, Nutrition), and click "Book Consultation". You can select either a 30-minute high-definition video diagnosis or an in-person greenhouse site inspection.',
  },
  {
    id: 'faq-7',
    category: 'account',
    question: 'How do I add multiple team members or greenhouse workers to one account?',
    answer:
      'Go to Account Settings > Team Permissions. Account owners can invite field technicians with "Read-Only Sensor Monitoring" or "Actuator Control" permissions to ensure safety protocols are followed across multi-zone operations.',
  },
  {
    id: 'faq-8',
    category: 'sensors',
    question: 'What happens if greenhouse temperature exceeds safe thresholds?',
    answer:
      'SmartGrow Automated Climate Safeguard triggers automatically. If internal temperature exceeds your set trigger point (default 32°C), the fogger misting pumps and exhaust ventilation fans activate immediately, and an urgent SMS/push notification is sent to the registered farm manager.',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: HelpCircle },
  { id: 'sensors', label: 'IoT Sensors & Automation', icon: Cpu },
  { id: 'marketplace', label: 'Crop Marketplace & Escrow', icon: ShoppingBag },
  { id: 'suppliers', label: 'Agri Supplies & Delivery', icon: Package },
  { id: 'expertconnect', label: 'Agronomist Consultations', icon: Sparkles },
  { id: 'account', label: 'Account & Security', icon: ShieldCheck },
];

export const SupportView = ({
  currentUser,
  onNavigateHome,
  onGoToDashboard,
  onSelectModule,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState('faq-1');

  // Support Ticket Form State
  const [ticketForm, setTicketForm] = useState({
    name: currentUser?.username || currentUser?.name || '',
    email: currentUser?.email || '',
    category: 'sensors',
    priority: 'Normal',
    subject: '',
    message: '',
  });

  const [submittedTickets, setSubmittedTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('smartgrow_support_tickets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newTicket = {
        id: `SG-SUP-${Math.floor(1000 + Math.random() * 9000)}`,
        ...ticketForm,
        createdAt: new Date().toISOString(),
        status: 'In Review',
      };

      const updated = [newTicket, ...submittedTickets];
      setSubmittedTickets(updated);
      try {
        localStorage.setItem('smartgrow_support_tickets', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not persist ticket to localStorage:', err);
      }

      setIsSubmitting(false);
      setSubmitSuccess(newTicket.id);
      setTicketForm((prev) => ({
        ...prev,
        subject: '',
        message: '',
      }));
    }, 700);
  };

  return (
    <div className="w-full text-slate-900 pb-20 animate-in fade-in duration-300">
      {/* Top Breadcrumb Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-6 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 transition-all cursor-pointer shadow-xs group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </button>

        {/* Live System Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>All Systems Operational (99.98% SLA)</span>
        </div>
      </div>

      {/* 3 Contact Support Channel Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 24/7 Hotline */}
          <div className="rounded-2xl bg-white border border-slate-200 hover:border-slate-300 p-6 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-4 group-hover:scale-105 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                24/7 Emergency Greenhouse Hotline
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Immediate response for catastrophic climate spikes, pump shutdowns, or IoT gateway offline events.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <a
                href="tel:+94112345678"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#0b3b2c] hover:text-[#07291e] transition-colors"
              >
                <span>+94 (11) 234-5678</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="block text-[11px] text-slate-400 mt-1">
                Toll-free across all agricultural provinces
              </span>
            </div>
          </div>

          {/* Card 2: Live Agronomist Consultation */}
          <div className="rounded-2xl bg-white border border-slate-200 hover:border-slate-300 p-6 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mb-4 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                ExpertConnect Agronomist Desk
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Speak directly with certified crop doctors, soil scientists, and hydroponic consultants.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => onSelectModule && onSelectModule('hydroponics')}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#0b3b2c] hover:text-[#07291e] transition-colors cursor-pointer"
              >
                <span>Open ExpertConnect &rarr;</span>
              </button>
              <span className="block text-[11px] text-slate-400 mt-1">
                Mon - Sat: 7:00 AM - 7:00 PM SLST
              </span>
            </div>
          </div>

          {/* Card 3: Email & Technical Tickets */}
          <div className="rounded-2xl bg-white border border-slate-200 hover:border-slate-300 p-6 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-4 group-hover:scale-105 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                Dedicated Technical Helpdesk
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Detailed hardware debugging, custom firmware integration, or billing and order inquiries.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <a
                href="mailto:support@smartgrow.lk"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#0b3b2c] hover:text-[#07291e] transition-colors"
              >
                <span>support@smartgrow.lk</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="block text-[11px] text-slate-400 mt-1">
                Guaranteed 2-hour response window
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: FAQs & Submit Ticket Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Knowledge Base & FAQs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Answers curated by SmartGrow hardware engineers and agronomists
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search FAQs..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 focus:border-[#0b3b2c] text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0b3b2c] text-white font-bold shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* FAQ Accordion List */}
            <div className="space-y-3 pt-2">
              {filteredFaqs.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 shadow-xs">
                  <p>No matching questions found for "{searchQuery}".</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="mt-3 text-xs font-bold text-emerald-700 underline"
                  >
                    Clear search filter
                  </button>
                </div>
              ) : (
                filteredFaqs.map((faq) => {
                  const isExpanded = expandedFaq === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all overflow-hidden shadow-xs"
                    >
                      <button
                        onClick={() =>
                          setExpandedFaq(isExpanded ? null : faq.id)
                        }
                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-slate-900 hover:text-emerald-900 cursor-pointer gap-4"
                      >
                        <span className="leading-snug">{faq.question}</span>
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-200">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Submit Ticket Form & Recent Tickets (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Ticket Submission Card */}
            <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Submit Support Ticket
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct line to SmartGrow engineering & support
                  </p>
                </div>
              </div>

              {submitSuccess && (
                <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-start gap-3 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-700 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sm text-emerald-800">
                      Ticket {submitSuccess} Logged!
                    </span>
                    <span>
                      Our agronomist / IoT support specialist has received your request and will reply via email within 2 hours.
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={ticketForm.name}
                      onChange={(e) =>
                        setTicketForm({ ...ticketForm, name: e.target.value })
                      }
                      placeholder="e.g. Iresha Perera"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#0b3b2c] text-slate-900 text-xs outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      required
                      value={ticketForm.email}
                      onChange={(e) =>
                        setTicketForm({ ...ticketForm, email: e.target.value })
                      }
                      placeholder="user@smartgrow.lk"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#0b3b2c] text-slate-900 text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Issue Category
                    </label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) =>
                        setTicketForm({ ...ticketForm, category: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#0b3b2c] text-slate-900 text-xs outline-none transition-all cursor-pointer"
                    >
                      <option value="sensors">IoT Sensors & Telemetry</option>
                      <option value="marketplace">Crop Marketplace & Orders</option>
                      <option value="suppliers">Agri Supplies & Hardware</option>
                      <option value="expertconnect">Agronomist Consultation</option>
                      <option value="account">Account & Permissions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Priority Level
                    </label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) =>
                        setTicketForm({ ...ticketForm, priority: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#0b3b2c] text-slate-900 text-xs outline-none transition-all cursor-pointer"
                    >
                      <option value="Normal">Normal Inquiry</option>
                      <option value="High">High (Impacting Operations)</option>
                      <option value="Urgent">Urgent (Crop / Hardware Risk)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Subject / Summary
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketForm.subject}
                    onChange={(e) =>
                      setTicketForm({ ...ticketForm, subject: e.target.value })
                    }
                    placeholder="Brief summary of the inquiry or issue..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#0b3b2c] text-slate-900 text-xs outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Detailed Message & Greenhouse Details
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={ticketForm.message}
                    onChange={(e) =>
                      setTicketForm({ ...ticketForm, message: e.target.value })
                    }
                    placeholder="Describe what occurred, node IDs, crop symptoms, or order numbers..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#0b3b2c] text-slate-900 text-xs outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-[#0b3b2c] hover:bg-[#07291e] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Ticket...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Dispatch Support Ticket</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* User's Recent Support Tickets */}
            {submittedTickets.length > 0 && (
              <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0b3b2c]">
                    Your Support Requests ({submittedTickets.length})
                  </h4>
                  <span className="text-[10px] text-slate-400">Stored locally</span>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto no-scrollbar">
                  {submittedTickets.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-slate-900 tracking-tight truncate">
                            {t.subject}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10.5px] text-slate-500">
                          <span>{t.id}</span>
                          <span>•</span>
                          <span>{t.category}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportView;
