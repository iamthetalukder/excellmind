'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getProgressStats, type ProgressStats as ProgressStatsData } from '@/lib/progressHelper';
import ProgressStats from '@/components/ProgressStats';
import WeakSubjectChart from '@/components/WeakSubjectChart';
import RoutineCard from '@/components/RoutineCard';

interface Student {
  id: string;
  name: string;
  email: string;
  weak_subjects: string[];
  available_hours_per_day: number;
  batch_id: string;
  status: string;
}

interface Batch {
  exam_date: string;
}

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
    daysUntilExam: number;
    summary: {
      weeklyWeakFocus: number;
      weeklystrongFocus: number;
      avgDailyHours: number;
    };
  };
}

export default function StudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [stats, setStats] = useState<ProgressStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const studentId = typeof window !== 'undefined' ? sessionStorage.getItem('studentId') : null;

      if (!studentId) {
        setMessage('✗ Not logged in. Please enroll first.');
        setLoading(false);
        return;
      }

      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (studentError || !studentData) {
        setMessage('✗ Student data not found.');
        setLoading(false);
        return;
      }

      setStudent(studentData);

      const { data: batchData, error: batchError } = await supabase
        .from('batches')
        .select('*')
        .eq('id', studentData.batch_id)
        .single();

      if (batchError || !batchData) {
        setMessage('✗ Batch not found.');
        setLoading(false);
        return;
      }

      setBatch(batchData);

      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .select('*')
        .eq('student_id', studentData.id)
        .eq('status', 'approved')
        .order('approved_at', { ascending: false })
        .limit(1)
        .single();

      if (routineError || !routineData) {
        setMessage('No approved routine yet. Check back after your instructor approves your enrollment.');
        setLoading(false);
        return;
      }

      setRoutine(routineData);

      const progressStats = await getProgressStats(studentData.id, studentData.weak_subjects);
      setStats(progressStats);
    } catch (error) {
      setMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading your dashboard...</div>
      </div>
    );
  }

  if (!student || !routine || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-white dark:bg-dark-900 p-8 rounded-xl border border-gray-200 dark:border-dark-800 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const routineData = routine.routine_data;
  const examDate = new Date(batch!.exam_date);
  const daysUntilExam = Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Welcome, {student.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your personalized SSC 2028 exam preparation dashboard.
          </p>
        </div>

        <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white p-8 rounded-xl mb-12 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-primary-100 mb-2">Exam Date</p>
              <p className="text-3xl font-bold">{examDate.toDateString()}</p>
            </div>
            <div>
              <p className="text-primary-100 mb-2">Days Remaining</p>
              <p className="text-3xl font-bold">{daysUntilExam} days</p>
            </div>
            <div>
              <p className="text-primary-100 mb-2">Recommended Daily Study</p>
              <p className="text-3xl font-bold">{routineData.summary.avgDailyHours.toFixed(1)}h</p>
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

        <div className="mb-12">
          <Link
            href="/dashboard/student/log-session"
            className="inline-block px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition transform hover:scale-105"
          >
            + Log Study Session
          </Link>
        </div>

        {stats && (
          <WeakSubjectChart
            bySubject={stats.bySubject}
            weakSubjects={student.weak_subjects}
          />
        )}

        <div className="mt-12 mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your 7-Day Routine</h2>
            <Link
              href="/dashboard/student/routine"
              className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
            >
              View Full Routine →
            </Link>
          </div>
          <div className="space-y-3">
            {routineData.routine.slice(0, 3).map((day) => (
              <RoutineCard key={day.date} day={day} />
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Showing first 3 days. <Link href="/dashboard/student/routine" className="text-primary-600 hover:text-primary-700 font-semibold">See all 7 days →</Link>
          </p>
        </div>

        {stats && stats.recentSessions.length > 0 && (
          <div className="bg-white dark:bg-dark-900 p-8 rounded-xl border border-gray-200 dark:border-dark-800 mb-12">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Recent Study Sessions</h3>
            <div className="space-y-3">
              {stats.recentSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{session.subject}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{session.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600 dark:text-primary-400">
                      {session.duration_minutes}m
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{session.session_type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
