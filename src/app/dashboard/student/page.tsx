'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getProgressStats, type ProgressStats as ProgressStatsData } from '@/lib/progressHelper';
import ProgressStats from '@/components/ProgressStats';

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [stats, setStats] = useState<ProgressStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/auth/student/login');
          return;
        }

        const { data, error: queryError } = await supabase
          .from('students')
          .select('*')
          .eq('auth_id', user.id)
          .single();

        if (queryError || !data) {
          setError('Student record not found. Please enroll first.');
          setLoading(false);
          return;
        }

        setStudent(data);
        setStats(await getProgressStats(data.id, data.weak_subjects || []));
        setLoading(false);
      } catch (err) {
        setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    };

    fetchStudent();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 dark:from-dark-900 dark:to-dark-950">
        <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 dark:from-dark-900 dark:to-dark-950">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">✗ {error || 'Not logged in. Please enroll first.'}</p>
          <Link href="/auth/student/signup" className="text-primary-600 hover:text-primary-700 font-semibold">
            Enroll Now →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-dark-900 dark:to-dark-950 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Welcome, {student.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Exam: SSC 2028 | School: {student.school} | Status: {student.status}
            </p>
          </div>
          <Link href="/dashboard/student/progress" className="text-primary-600 hover:text-primary-700 font-semibold">
            📊 View Progress
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/dashboard/student/routine"
            className="bg-white dark:bg-dark-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-dark-800 hover:shadow-xl transition"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">My 7-Day Routine</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">View your personalized study schedule.</p>
          </Link>

          <Link
            href="/dashboard/student/log-session"
            className="bg-white dark:bg-dark-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-dark-800 hover:shadow-xl transition"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Log Study Session</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Track your study hours and progress.</p>
          </Link>

          <div className="bg-white dark:bg-dark-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-dark-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Weak Subjects</h2>
            <div className="flex flex-wrap gap-2">
              {student.weak_subjects && student.weak_subjects.length > 0 ? (
                student.weak_subjects.map((subj: string) => (
                  <span
                    key={subj}
                    className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-full text-sm"
                  >
                    {subj}
                  </span>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-sm">None recorded</p>
              )}
            </div>
          </div>
        </div>

        {stats && (
          <ProgressStats
            todayMinutes={stats.todayMinutes}
            weekMinutes={stats.weekMinutes}
            monthMinutes={stats.monthMinutes}
          />
        )}
      </div>
    </div>
  );
}
