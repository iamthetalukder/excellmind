'use client';

import Link from 'next/link';

export default function InstructorLogin() {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-dark-900 dark:to-dark-950">
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white dark:bg-dark-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-dark-800">
          <h2 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Instructor Login</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Access your instructor dashboard.
          </p>

          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Coming Soon</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Instructor login functionality will be available soon. For now, use your registration email to access the dashboard.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/auth/instructor/signup"
              className="text-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition"
            >
              Register Now
            </Link>
            <Link
              href="/"
              className="text-center text-primary-600 hover:text-primary-700 font-semibold"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
