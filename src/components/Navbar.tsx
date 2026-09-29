'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Restore the saved theme and apply it, so the toggle and the page agree on load.
    const dark = localStorage.getItem('theme') === 'dark';
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const toggleTheme = () => {
    const dark = !isDark;
    setIsDark(dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', dark);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo + Text */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Image
              src="/images/logo-mark.png"
              alt="ExcelMind"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-xl font-bold text-slate-900 dark:text-white">ExcelMind</span>
          </Link>

          {/* Right Side: Theme + Auth */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
              aria-label="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Auth Buttons */}
            {user ? (
              <>
                <span className="text-sm text-slate-600 dark:text-slate-300">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/student/login"
                  className="px-4 py-2 text-slate-900 dark:text-white hover:text-slate-600 text-sm"
                >
                  Student Login
                </Link>
                <Link
                  href="/auth/instructor/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Instructor Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
