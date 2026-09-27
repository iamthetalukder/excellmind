'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'student' | 'instructor'>('student');

  return (
    <div className="bg-gradient-to-b from-primary-50 to-white dark:from-dark-900 dark:to-dark-950">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-fade-in">
          <h1 className="text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              ExcelMind
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Personalized exam preparation for Bangladesh SSC & HSC students. AI-generated routines, progress tracking, and teacher dashboards — all aligned with your curriculum.
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Link
              href="/auth/student/signup"
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition transform hover:scale-105"
            >
              Enroll as Student
            </Link>
            <Link
              href="/auth/instructor/signup"
              className="px-8 py-3 bg-white dark:bg-dark-800 border-2 border-primary-600 text-primary-600 dark:text-primary-400 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-dark-700 transition"
            >
              Sign Up as Instructor
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Why ExcelMind?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-dark-900 p-8 rounded-xl border border-gray-200 dark:border-dark-800 hover:shadow-lg dark:hover:shadow-2xl transition">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-3">Personalized Routines</h3>
            <p className="text-gray-600 dark:text-gray-400">
              AI-generated daily schedules tailored to your available hours and weak subjects based on Sara's proven methodology.
            </p>
          </div>

          <div className="bg-white dark:bg-dark-900 p-8 rounded-xl border border-gray-200 dark:border-dark-800 hover:shadow-lg dark:hover:shadow-2xl transition">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3">Real-Time Progress</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track study hours, weak subject focus, and exam readiness with weekly performance summaries and analytics.
            </p>
          </div>

          <div className="bg-white dark:bg-dark-900 p-8 rounded-xl border border-gray-200 dark:border-dark-800 hover:shadow-lg dark:hover:shadow-2xl transition">
            <div className="text-4xl mb-4">👨‍🏫</div>
            <h3 className="text-xl font-bold mb-3">Teacher Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Manage multiple students, approve enrollments, generate personalized routines, and monitor progress at scale.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 bg-primary-50 dark:bg-dark-900 rounded-2xl my-20">
        <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { num: '01', title: 'Enroll', desc: 'Sign up and share your details — weak subjects, available hours, and tutor assignments.' },
            { num: '02', title: 'Generate', desc: 'AI creates your personalized routine based on your profile and weak subjects.' },
            { num: '03', title: 'Study', desc: 'Follow your routine daily. Track every session and monitor your progress in real time.' },
            { num: '04', title: 'Succeed', desc: 'Reach exam day fully prepared with data-driven insights and focused study habits.' },
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-3">{step.num}</div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
          Choose what works for you. All plans include personalized routines and progress tracking.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Free',
              price: '0',
              features: ['Try for free', 'Basic routine', 'Limited progress tracking', 'Community support'],
              cta: 'Start Free',
              ctaHref: '/auth/student/signup',
            },
            {
              name: 'Pro',
              price: '99',
              features: ['Full AI routines', 'Real-time progress analytics', 'Weekly performance reports', 'Priority support'],
              cta: 'Upgrade to Pro',
              ctaHref: '/auth/student/signup',
              highlight: true,
            },
            {
              name: 'Instructor',
              price: '299',
              features: ['Manage up to 50 students', 'Bulk routine generation', 'Student analytics dashboard', 'Dedicated support'],
              cta: 'Sign Up',
              ctaHref: '/auth/instructor/signup',
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-xl border p-8 transition transform hover:scale-105 ${
                plan.highlight
                  ? 'bg-gradient-to-b from-primary-600 to-primary-700 text-white border-primary-600 shadow-lg'
                  : 'bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-800'
              }`}
            >
              {plan.highlight && <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-accent-500 text-white px-4 py-1 rounded-full text-sm font-bold">Most Popular</div>}

              <h3 className={`text-2xl font-bold mb-2 ${!plan.highlight && 'text-gray-900 dark:text-gray-50'}`}>
                {plan.name}
              </h3>
              <div className="mb-6">
                <span className={`text-4xl font-bold ${!plan.highlight && 'text-primary-600'}`}>
                  ৳{plan.price}
                </span>
                <span className={`text-sm ${plan.highlight ? 'text-primary-100' : 'text-gray-600 dark:text-gray-400'}`}>
                  {plan.price === '0' ? 'forever' : '/month'}
                </span>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="text-accent-500 font-bold mt-1">✓</span>
                    <span className={!plan.highlight ? 'text-gray-600 dark:text-gray-400' : ''}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`block text-center py-2 px-4 rounded-lg font-semibold transition ${
                  plan.highlight
                    ? 'bg-white text-primary-600 hover:bg-gray-100'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Bangladesh SSC & HSC Curriculum</h2>

        <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 p-12">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {['Bengali', 'English', 'Math', 'Higher Math', 'Physics', 'Chemistry', 'Biology', 'Social Science', 'Islamic Studies'].map((subject) => (
              <div key={subject} className="p-4 bg-gray-50 dark:bg-dark-800 rounded-lg text-center font-semibold">
                {subject}
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
            All materials aligned with official Bangladesh Education Board curriculum and exam patterns.
          </p>
        </div>
      </section>
    </div>
  );
}
