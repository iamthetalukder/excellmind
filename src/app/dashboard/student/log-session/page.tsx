'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logStudySession } from '@/lib/progressHelper';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LogSessionPage() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [sessionType, setSessionType] = useState<'study' | 'break' | 'review'>('study');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);

  useEffect(() => {
    const loadStudent = async () => {
      const studentId = typeof window !== 'undefined' ? sessionStorage.getItem('studentId') : null;

      if (!studentId) {
        setMessage('✗ Not logged in. Please enroll first.');
        return;
      }

      const { data: students } = await supabase
        .from('students')
        .select('weak_subjects')
        .eq('id', studentId)
        .single();

      if (students) {
        setWeakSubjects(students.weak_subjects);
        setSubject(students.weak_subjects[0] || '');
      }
    };

    loadStudent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const studentId = typeof window !== 'undefined' ? sessionStorage.getItem('studentId') : null;

      if (!studentId) {
        setMessage('✗ Not logged in.');
        setLoading(false);
        return;
      }

      await logStudySession(
        studentId,
        subject,
        parseInt(durationMinutes),
        sessionType,
        notes
      );

      setMessage('✓ Study session logged successfully!');
      setTimeout(() => {
        router.push('/dashboard/student');
      }, 1500);
    } catch (error) {
      setMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-dark-900 dark:to-dark-950 py-12">
      <div className="max-w-md mx-auto bg-white dark:bg-dark-900 p-8 rounded-xl border border-gray-200 dark:border-dark-800 shadow-lg">
        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Log Study Session</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">Record your completed study time.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select a subject</option>
              {weakSubjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="600"
              step="5"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Session Type</label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as 'study' | 'break' | 'review')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="study">Study Session</option>
              <option value="review">Review Session</option>
              <option value="break">Break</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the session go?"
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
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
            {loading ? 'Logging...' : 'Log Session'}
          </button>

          <p className="text-center text-xs text-gray-600 dark:text-gray-400">
            <Link href="/dashboard/student" className="text-primary-600 hover:text-primary-700 font-semibold">
              Back to Dashboard
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
