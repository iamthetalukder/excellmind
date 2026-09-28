'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    // Apply the stored theme on mount, otherwise state and the `dark` class drift apart.
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    // Listen to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    // Set explicitly from newTheme rather than flipping whatever class is present.
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-dark-900 shadow-md border-b border-gray-200 dark:border-dark-800">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          ExcelMind
        </Link>

        <div className="flex items-center gap-6">
          {isLoggedIn && (
            <div className="flex items-center gap-4">
              <Link href="/dashboard/student" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium">
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
              >
                Sign Out
              </button>
            </div>
          )}
          {!isLoggedIn && (
            <div className="flex items-center gap-4">
              <Link href="/auth/student/signup" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium">
                Enroll
              </Link>
              <Link href="/auth/instructor/signup" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium">
                Teach
              </Link>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="px-3 py-1 bg-gray-200 dark:bg-dark-800 text-gray-800 dark:text-gray-200 rounded-lg transition"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
}
