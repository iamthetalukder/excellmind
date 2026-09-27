'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import RoutineCard from '@/components/RoutineCard';

interface Routine {
  routine_data: {
    routine: Array<{
      date: string;
      dayOfWeek: string;
      slots: Array<{
        subject: string;
        startTime: string;
        endTime: string;
        type: 'weak' | 'strong' | 'break';
        durationMinutes: number;
      }>;
      totalStudyMinutes: number;
      weakSubjectMinutes: number;
      strongSubjectMinutes: number;
    }>;
  };
}

export default function RoutinePage() {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadRoutine();
  }, []);

  const loadRoutine = async () => {
    try {
      const studentId = typeof window !== 'undefined' ? sessionStorage.getItem('studentId') : null;

      if (!studentId) {
        setMessage('✗ Not logged in. Please enroll first.');
        setLoading(false);
        return;
      }

      const { data: routineData, error } = await supabase
        .from('routines')
        .select('*')
        .eq('student_id', studentId)
        .eq('status', 'approved')
        .order('approved_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !routineData) {
        setMessage('No approved routine yet.');
        setLoading(false);
        return;
      }

      setRoutine(routineData);
    } catch (error) {
      setMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading routine...</div>
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-white dark:bg-dark-900 p-8 rounded-xl border border-gray-200 dark:border-dark-800 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
            <Link
              href="/dashboard/student"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Your 7-Day Routine</h1>
          <p className="text-gray-600 dark:text-gray-400">Click any day to see detailed study slots.</p>
        </div>

        <div className="space-y-4 mb-12">
          {routine.routine_data.routine.map((day) => (
            <RoutineCard key={day.date} day={day} />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/dashboard/student"
            className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
