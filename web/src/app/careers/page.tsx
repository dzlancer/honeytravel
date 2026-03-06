'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import clsx from 'clsx';
import {
  Lightbulb,
  Globe,
  TrendingUp,
  MapPin,
  Clock,
  Briefcase,
  Send,
} from 'lucide-react';

const VALUES = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'We push boundaries to build the best travel platform for Algeria and beyond. New ideas are always welcome.',
  },
  {
    icon: Globe,
    title: 'Diversity',
    description:
      'Our team represents Algeria\'s rich cultural mosaic. We celebrate different perspectives, backgrounds, and languages.',
  },
  {
    icon: TrendingUp,
    title: 'Growth',
    description:
      'We invest in our people. Expect mentorship, learning budgets, and real opportunities to advance your career.',
  },
];

const POSITIONS = [
  {
    id: 1,
    title: 'Frontend Developer',
    department: 'Engineering',
    location: 'Algiers',
    type: 'Full-time',
    description:
      'Build beautiful, performant interfaces with React, Next.js, and TypeScript. You\'ll shape the product millions of Algerian travelers use every day.',
  },
  {
    id: 2,
    title: 'Backend Developer',
    department: 'Engineering',
    location: 'Algiers',
    type: 'Full-time',
    description:
      'Design and scale our Node.js / NestJS APIs, databases, and microservices. Work on booking engines, payment integrations, and real-time systems.',
  },
  {
    id: 3,
    title: 'Marketing Manager',
    department: 'Marketing',
    location: 'Algiers',
    type: 'Full-time',
    description:
      'Drive brand awareness and user acquisition across Algeria. Own campaigns, partnerships, and growth strategy for our travel platform.',
  },
  {
    id: 4,
    title: 'Customer Support Lead',
    department: 'Operations',
    location: 'Algiers',
    type: 'Full-time',
    description:
      'Lead a team of support agents delivering world-class service in Arabic, French, and English. Resolve booking issues and champion the customer voice.',
  },
  {
    id: 5,
    title: 'Content Writer',
    department: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Craft compelling travel guides, blog posts, and marketing copy that showcase Algeria\'s incredible destinations and inspire travelers.',
  },
];

export default function CareersPage() {
  const { t } = useTranslation();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-algerian text-white py-16 md:py-20">
        <div className="section text-center">
          <h1 className="text-display-md md:text-display-lg mb-3">Join Our Team</h1>
          <p className="text-primary-200 text-lg max-w-xl mx-auto">
            Help us build the future of travel in Algeria. We&rsquo;re looking for passionate people to join our mission.
          </p>
        </div>
      </section>

      {/* Company Culture */}
      <section className="section section-padding">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-heading-lg text-center mb-2">Our Values</h2>
          <p className="text-gray-600 text-center mb-10 max-w-lg mx-auto">
            What drives us every day at Travel Shop Algeria
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="card p-6 text-center">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-heading-md mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="section section-padding bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-heading-lg text-center mb-2">Open Positions</h2>
          <p className="text-gray-600 text-center mb-10 max-w-lg mx-auto">
            Find a role that matches your skills and passion
          </p>
          <div className="space-y-4">
            {POSITIONS.map((job) => (
              <div key={job.id} className="card p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-heading-md mb-1">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {job.department}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {job.type}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {job.description}
                    </p>
                  </div>
                  <a
                    href={`mailto:careers@travelshopalgeria.com?subject=Application: ${job.title}`}
                    className="btn-primary inline-flex items-center gap-2 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    Apply
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spontaneous Application CTA */}
      <section className="section section-padding">
        <div className="max-w-3xl mx-auto">
          <div className="card p-8 text-center bg-primary-50 border-primary-100">
            <h3 className="text-heading-lg mb-2">Don&rsquo;t see your role?</h3>
            <p className="text-gray-600 mb-4">
              We&rsquo;re always looking for talented people. Send us a spontaneous application and tell us how you can contribute to our mission.
            </p>
            <a
              href="mailto:careers@travelshopalgeria.com?subject=Spontaneous Application"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send Application
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
