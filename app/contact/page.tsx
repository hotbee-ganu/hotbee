'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { SITE, mailHref, telHref } from '@/lib/siteConfig';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-hotbee-500">
          Customer Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Get in Touch with HOTBEE
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 font-light">
          Have questions regarding an order, sizing, or Qikink POD partnership? Our support team is here to assist 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-hotbee-500/20 space-y-6">
            <h3 className="text-base font-extrabold text-white">HOTBEE Support HQ</h3>

            <div className="space-y-4 text-xs text-gray-300">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-hotbee-500/10 text-hotbee-500 border border-hotbee-500/20 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Email Address</h4>
                  <a href={mailHref} className="text-hotbee-500 hover:underline break-all">
                    {SITE.supportEmail}
                  </a>
                  <p className="text-[10px] text-gray-500">Response within 2 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-hotbee-500/10 text-hotbee-500 border border-hotbee-500/20 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Phone Support</h4>
                  <a href={telHref} className="text-hotbee-500 hover:underline">
                    {SITE.supportPhoneDisplay}
                  </a>
                  <p className="text-[10px] text-gray-500">{SITE.supportHours}</p>
                  <a
                    href={SITE.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[11px] font-bold hover:bg-green-500/20 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Chat on WhatsApp
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-hotbee-500/10 text-hotbee-500 border border-hotbee-500/20 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Brand Headquarters</h4>
                  <p>HOTBEE Commerce Platform, 100ft Road, Indiranagar, Bengaluru, KA 560038</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-8 rounded-3xl border border-hotbee-500/30 space-y-6 shadow-glow-gold-lg">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-hotbee-500" /> Send Us a Message
            </h3>

            {submitted ? (
              <div className="p-8 text-center space-y-3 bg-hotbee-500/10 rounded-2xl border border-hotbee-500/30">
                <CheckCircle2 className="w-12 h-12 text-hotbee-500 mx-auto" />
                <h4 className="font-bold text-white text-base">Message Sent Successfully!</h4>
                <p className="text-xs text-gray-300">Thank you for reaching out. A support representative will respond to {formData.email} shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Roy"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="ananya@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 77951 83353"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">Subject *</label>
                    <input
                      type="text"
                      required
                      placeholder="Order Query / Print Quality"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your inquiry in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="glass-btn-primary w-full py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Send className="w-4 h-4 text-black" />
                  <span>Submit Support Request</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
