'use client';

import Link from 'next/link';

export default function InstructorDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Instructor Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your students and monitor exam preparation progress at scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Active Students', value: '0', icon: '👥' },
            { label: 'Routines Generated', value: '0', icon: '📚' },
            { label: 'Avg Progress', value: '0%', icon: '📊' },
            { label: 'Exam Countdown', value: '500 days', icon: '🎯' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-200 dark:border-dark-800">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Link href="/dashboard/instructor/manage-students" className="block">
            <div className="bg-white dark:bg-dark-900 p-8 rounded-xl border border-gray-200 dark:border-dark-800 hover:shadow-lg dark:hover:shadow-2xl transition cursor-pointer h-full">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Manage Students</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                View enrollment requests, generate personalized routines, and approve students.
              </p>
              <div className="text-primary-600 dark:text-primary-400 font-semibold">
                Go to Manager →
              </div>
            </div>
          </Link>

          <div className="bg-white dark:bg-dark-900 p-8 rounded-xl border border-gray-200 dark:border-dark-800">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Student Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Track progress, identify weak spots, and send targeted feedback to each student.
            </p>
            <button disabled className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-800 text-gray-500 dark:text-gray-400 rounded-lg font-semibold cursor-not-allowed">
              Coming Soon
            </button>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900 p-8 rounded-xl border border-green-200 dark:border-green-800">
          <h3 className="font-bold text-green-900 dark:text-green-100 mb-2">Routine Generator Live</h3>
          <p className="text-green-800 dark:text-green-200 text-sm">
            The routine generator is now live. Go to "Manage Students" to start generating personalized routines for enrolled students.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
