'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth';

export default function InstructorLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await signIn(email, password);
      setMessage('✓ Signed in successfully! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard/instructor');
      }, 1500);
    } catch (error) {
      setMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-dark-900 dark:to-dark-950">
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white dark:bg-dark-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-dark-800">
          <h2 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Instructor Login</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sign in to your instructor dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.includes('✗')
                    ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
                    : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold disabled:opacity-50 transition"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/auth/instructor/signup" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign Up
              </Link>
            </div>
          </form>
        </div>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-semibold">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
