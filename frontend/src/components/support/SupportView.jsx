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
    <div className="w-full text-white pb-20 animate-in fade-in duration-300">
      {/* Top Breadcrumb Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-6 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs sm:text-sm font-semibold text-emerald-300 hover:text-white transition-all cursor-pointer shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </button>

        {/* Live System Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>All Systems Operational (99.98% SLA)</span>
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-12">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#0c2e22]/90 via-[#0f382a]/80 to-[#144735]/90 border border-white/15 p-8 sm:p-12 md:p-16 overflow-hidden shadow-2xl backdrop-blur-xl">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[90px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-emerald-300 mb-4">
              <LifeBuoy className="w-3.5 h-3.5 text-emerald-300" />
              <span>SmartGrow Support & Knowledge Base</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              How can we assist your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-[#4de1b7]">
                agricultural operations?
              </span>
            </h1>

            <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-8">
              Find instant answers for sensor calibrations, marketplace orders, and expert consultations, or contact our engineering and agronomy team directly.
            </p>

            {/* Live Search Input */}
            <div className="relative w-full max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-300/80">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search troubleshooting, sensor calibration, delivery, escrow..."
                className="w-full pl-12 pr-10 py-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.15] border border-white/20 focus:border-emerald-400 text-white placeholder-white/40 text-sm sm:text-base font-medium outline-none transition-all shadow-inner backdrop-blur-md"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3 Contact Support Channel Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 24/7 Hotline */}
          <div className="rounded-2xl bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-400/30 p-6 transition-all duration-300 flex flex-col justify-between group shadow-lg backdrop-blur-md">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 mb-4 group-hover:scale-105 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">
                24/7 Emergency Greenhouse Hotline
              </h3>
              <p className="text-xs sm:text-sm text-white/65 leading-relaxed mb-4">
                Immediate response for catastrophic climate spikes, pump shutdowns, or IoT gateway offline events.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10">
              <a
                href="tel:+94112345678"
                className="inline-flex items-center gap-2 text-sm font-bold text-emerald-300 hover:text-white transition-colors"
              >
                <span>+94 (11) 234-5678</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="block text-[11px] text-white/40 mt-1">
                Toll-free across all agricultural provinces
              </span>
            </div>
          </div>

          {/* Card 2: Live Agronomist Consultation */}
          <div className="rounded-2xl bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-400/30 p-6 transition-all duration-300 flex flex-col justify-between group shadow-lg backdrop-blur-md">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 mb-4 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">
                ExpertConnect Agronomist Desk
              </h3>
              <p className="text-xs sm:text-sm text-white/65 leading-relaxed mb-4">
                Speak directly with certified crop doctors, soil scientists, and hydroponic consultants.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => onSelectModule && onSelectModule('hydroponics')}
                className="inline-flex items-center gap-2 text-sm font-bold text-teal-300 hover:text-white transition-colors cursor-pointer"
              >
                <span>Open ExpertConnect &rarr;</span>
              </button>
              <span className="block text-[11px] text-white/40 mt-1">
                Mon - Sat: 7:00 AM - 7:00 PM SLST
              </span>
            </div>
          </div>

          {/* Card 3: Email & Technical Tickets */}
          <div className="rounded-2xl bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-400/30 p-6 transition-all duration-300 flex flex-col justify-between group shadow-lg backdrop-blur-md">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-4 group-hover:scale-105 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">
                Dedicated Technical Helpdesk
              </h3>
              <p className="text-xs sm:text-sm text-white/65 leading-relaxed mb-4">
                Detailed hardware debugging, custom firmware integration, or billing and order inquiries.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10">
              <a
                href="mailto:support@smartgrow.lk"
                className="inline-flex items-center gap-2 text-sm font-bold text-amber-300 hover:text-white transition-colors"
              >
                <span>support@smartgrow.lk</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="block text-[11px] text-white/40 mt-1">
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-white/60 text-xs sm:text-sm mt-1">
                  Answers curated by SmartGrow hardware engineers and agronomists
                </p>
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
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                        : 'bg-white/10 hover:bg-white/15 text-white/70 hover:text-white border border-white/10'
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
                <div className="p-8 rounded-2xl bg-white/[0.04] border border-white/10 text-center text-white/50">
                  <p>No matching questions found for "{searchQuery}".</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="mt-3 text-xs font-bold text-emerald-300 underline"
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
                      className="rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 transition-all overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedFaq(isExpanded ? null : faq.id)
                        }
                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-white/90 hover:text-white cursor-pointer gap-4"
                      >
                        <span className="leading-snug">{faq.question}</span>
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-emerald-300">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 text-xs sm:text-sm text-white/75 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in duration-200">
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
            <div className="rounded-3xl bg-gradient-to-b from-white/[0.09] to-white/[0.04] border border-white/15 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Submit Support Ticket
                  </h3>
                  <p className="text-xs text-white/60">
                    Direct line to SmartGrow engineering & support
                  </p>
                </div>
              </div>

              {submitSuccess && (
                <div className="mb-5 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs flex items-start gap-3 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-300 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sm text-emerald-300">
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
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/25 border border-white/15 focus:border-emerald-400 text-white text-xs outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/25 border border-white/15 focus:border-emerald-400 text-white text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                      Issue Category
                    </label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) =>
                        setTicketForm({ ...ticketForm, category: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a2720] border border-white/15 focus:border-emerald-400 text-white text-xs outline-none transition-all cursor-pointer"
                    >
                      <option value="sensors">IoT Sensors & Telemetry</option>
                      <option value="marketplace">Crop Marketplace & Orders</option>
                      <option value="suppliers">Agri Supplies & Hardware</option>
                      <option value="expertconnect">Agronomist Consultation</option>
                      <option value="account">Account & Permissions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                      Priority Level
                    </label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) =>
                        setTicketForm({ ...ticketForm, priority: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a2720] border border-white/15 focus:border-emerald-400 text-white text-xs outline-none transition-all cursor-pointer"
                    >
                      <option value="Normal">Normal Inquiry</option>
                      <option value="High">High (Impacting Operations)</option>
                      <option value="Urgent">Urgent (Crop / Hardware Risk)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/25 border border-white/15 focus:border-emerald-400 text-white text-xs outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/25 border border-white/15 focus:border-emerald-400 text-white text-xs outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-[#3bc7a1] hover:from-emerald-300 hover:to-[#4de1b7] text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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
              <div className="rounded-3xl bg-white/[0.05] border border-white/10 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Your Support Requests ({submittedTickets.length})
                  </h4>
                  <span className="text-[10px] text-white/40">Stored locally</span>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto no-scrollbar">
                  {submittedTickets.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-white tracking-tight truncate">
                            {t.subject}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10.5px] text-white/50">
                          <span>{t.id}</span>
                          <span>•</span>
                          <span>{t.category}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 shrink-0">
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
