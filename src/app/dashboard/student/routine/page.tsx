'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import RoutineCard from '@/components/RoutineCard';

export default function RoutinePage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [routine, setRoutine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/auth/student/login');
          return;
        }

        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('auth_id', user.id)
          .single();

        if (studentError || !studentData) {
          setError('Student record not found.');
          setLoading(false);
          return;
        }

        setStudent(studentData);

        const { data: routineData, error: routineError } = await supabase
          .from('routines')
          .select('*')
          .eq('student_id', studentData.id)
          .eq('status', 'approved')
          .order('approved_at', { ascending: false })
          .limit(1)
          .single();

        if (routineError && routineError.code !== 'PGRST116') {
          setError('Error loading routine.');
          setLoading(false);
          return;
        }

        setRoutine(routineData || null);
        setLoading(false);
      } catch (err) {
        setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 dark:from-dark-900 dark:to-dark-950">
        <p className="text-gray-600 dark:text-gray-400">Loading routine...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 dark:from-dark-900 dark:to-dark-950">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">✗ {error || 'Not logged in.'}</p>
          <Link href="/auth/student/login" className="text-primary-600 hover:text-primary-700 font-semibold">
            Sign In →
          </Link>
        </div>
      </div>
    );
  }

  const days = routine?.routine_data?.routine ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-dark-900 dark:to-dark-950 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard/student" className="text-primary-600 hover:text-primary-700 font-semibold">
              ← Back to Dashboard
            </Link>
            <Link href="/dashboard/student/progress" className="text-primary-600 hover:text-primary-700 font-semibold">
              📊 Progress
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Your 7-Day Routine</h1>
          <p className="text-gray-600 dark:text-gray-400">Personalized study schedule for {student.name}</p>
        </div>

        {days.length === 0 ? (
          <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg text-yellow-700 dark:text-yellow-200 mb-8">
            ⚠ No routine generated yet. Ask your instructor to generate one.
          </div>
        ) : (
          <div className="space-y-4">
            {days.map((day: any) => (
              <RoutineCard key={day.date} day={day} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
