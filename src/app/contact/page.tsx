'use client';

import React, { useState } from 'react';
import { 
  Mail, Phone, MapPin, MessageCircle, Send, 
  CheckCircle2, Sparkles, Building2, Gift, ShieldCheck 
} from 'lucide-react';
import { submitInquiry } from '@/lib/api';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Bulk / Corporate Order');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await submitInquiry({ name, email, phone, subject, message });
      if (res.status === 'success') {
        setSuccess(true);
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
      } else {
        setError(res.message || 'Failed to submit inquiry');
      }
    } catch (err: any) {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/70 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1 text-xs font-bold text-violet-700 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Direct Studio Support</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 sm:text-4xl">
            Get in Touch With Our Artisans
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Have questions about your photo resolution, custom shape cutting, or bulk corporate gifting discounts? We are here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left: Contact Info & Value Badges */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
                Studio Headquarters
              </h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900">Ebanzo Precision Studios</h4>
                    <p className="text-stone-500 mt-0.5 leading-relaxed">
                      Ebanzo Printing & Laser Cut Facility, Industrial Estate, Pan-India Dispatch Center.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900">Email Inquiries</h4>
                    <p className="text-stone-500">support@ebanzo.com • orders@ebanzo.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900">WhatsApp Instant Support</h4>
                    <p className="text-stone-500">Mon - Sat: 9:30 AM to 8:00 PM IST</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100">
                <a
                  href="https://wa.me/919876543210?text=Hi%20Ebanzo,%20I%20have%20an%20inquiry%20regarding%20bulk%20personalized%20gifting"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Start WhatsApp Chat</span>
                </a>
              </div>
            </div>

            {/* Corporate Gifting Perks Card */}
            <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-900 to-purple-950 p-6 text-white shadow-md">
              <div className="flex items-center gap-2 mb-2 text-amber-300 font-bold text-xs">
                <Building2 className="h-4 w-4" />
                <span>Corporate & Event Gifting</span>
              </div>
              <h3 className="text-base font-extrabold text-white">Bulk Orders over 50+ Units?</h3>
              <p className="mt-1 text-xs text-purple-200 leading-relaxed">
                Enjoy tiered volume pricing, custom branded packaging boxes, and dedicated laser engraving assistance for employee appreciation and weddings.
              </p>
            </div>
          </div>

          {/* Right: Submission Form */}
          <div className="lg:col-span-7 rounded-3xl border border-stone-200 bg-white p-6 sm:p-10 shadow-sm">
            <h2 className="text-lg font-black text-stone-900 mb-1">Send Us a Message</h2>
            <p className="text-xs text-stone-500 mb-6">
              Fill in your details and our customization consultant will get back to you within 2-4 hours.
            </p>

            {success ? (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-emerald-950">Inquiry Received!</h3>
                <p className="mt-1 text-xs text-emerald-700 max-w-sm mx-auto">
                  Thank you for reaching out. One of our team members will contact you on WhatsApp or Email shortly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-5 rounded-full bg-emerald-700 px-6 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                >
                  Send Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aditi Roy"
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aditi@example.com"
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-violet-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Inquiry Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-violet-600"
                  >
                    <option value="Bulk / Corporate Order">Bulk / Corporate Order (50+ units)</option>
                    <option value="Wedding Favors & Return Gifts">Wedding Favors & Return Gifts</option>
                    <option value="Photo Customization Help">Photo Customization / Resolution Help</option>
                    <option value="Order Tracking Status">Order Tracking Status</option>
                    <option value="General Feedback">General Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Your Message / Requirements *</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe what you would like printed, quantity, preferred delivery deadline..."
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-violet-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-700 py-3.5 text-xs font-bold text-white shadow hover:bg-violet-800 transition-colors disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  <span>{loading ? 'Submitting...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
