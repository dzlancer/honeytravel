'use client';

import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import {
  Building2,
  Plane,
  Briefcase,
  Globe,
  Settings,
  BarChart3,
  Headphones,
  Send,
} from 'lucide-react';

const PARTNERSHIP_TYPES = [
  {
    icon: Building2,
    title: 'Hotel Partners',
    description:
      "List your property on Algeria's fastest-growing travel platform. Reach thousands of domestic and international travelers looking for accommodations across the country.",
  },
  {
    icon: Plane,
    title: 'Travel Agencies',
    description:
      'Integrate your tour packages and excursions with our platform. Gain access to a digital-first customer base and streamlined booking management tools.',
  },
  {
    icon: Briefcase,
    title: 'Corporate Travel',
    description:
      'Offer your employees seamless business travel booking. We provide dedicated account management, consolidated invoicing, and negotiated corporate rates.',
  },
];

const BENEFITS = [
  {
    icon: Globe,
    title: 'Wider Reach',
    description:
      'Tap into our growing customer base across Algeria and beyond. Your services gain visibility to thousands of active travelers every month.',
  },
  {
    icon: Settings,
    title: 'Easy Management',
    description:
      'Manage availability, pricing, and bookings from a single partner dashboard. Update your listings in real time with minimal effort.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description:
      'Track performance with detailed insights on views, bookings, revenue, and customer satisfaction — all in one place.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description:
      'Our dedicated partner success team is always available to help you resolve issues, optimize listings, and grow your business.',
  },
];

export default function PartnersPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    partnershipType: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    toast.success("Application submitted! We'll contact you shortly.");
    setForm({ name: '', email: '', company: '', partnershipType: '', message: '' });
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-algerian text-white py-16 md:py-20">
        <div className="section text-center">
          <h1 className="text-display-md md:text-display-lg mb-3">Become a Partner</h1>
          <p className="text-primary-200 text-lg max-w-xl mx-auto">
            Grow your business by partnering with Algeria&rsquo;s leading travel platform
          </p>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="section section-padding">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-heading-lg text-center mb-2">Partnership Types</h2>
          <p className="text-gray-600 text-center mb-10 max-w-lg mx-auto">
            Choose the partnership model that fits your business
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PARTNERSHIP_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.title} className="card p-6 text-center">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-heading-md mb-2">{type.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {type.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section section-padding bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-heading-lg text-center mb-2">Why Partner With Us</h2>
          <p className="text-gray-600 text-center mb-10 max-w-lg mx-auto">
            Everything you need to succeed on our platform
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="card p-6 text-center">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="text-heading-md mb-1">{benefit.title}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section section-padding">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-heading-lg text-center mb-2">Get Started</h2>
          <p className="text-gray-600 text-center mb-10 max-w-lg mx-auto">
            Fill out the form below and our partnerships team will get in touch
          </p>
          <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="input-label">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label htmlFor="email" className="input-label">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="company" className="input-label">
                  Company Name
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  required
                  value={form.company}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Your company"
                />
              </div>
              <div>
                <label htmlFor="partnershipType" className="input-label">
                  Partnership Type
                </label>
                <select
                  id="partnershipType"
                  name="partnershipType"
                  required
                  value={form.partnershipType}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="" disabled>
                    Select a type
                  </option>
                  <option value="hotel">Hotel Partner</option>
                  <option value="agency">Travel Agency</option>
                  <option value="corporate">Corporate Travel</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="input-label">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                value={form.message}
                onChange={handleChange}
                className="input-field resize-none"
                placeholder="Tell us about your business and how you would like to partner..."
              />
            </div>

            <button type="submit" className="btn-primary w-full inline-flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              Submit Application
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
