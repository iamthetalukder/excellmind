'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { logStudySession } from '@/lib/progressHelper';

export default function LogSessionPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    subject_id: '',
    duration_minutes: 30,
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

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
          setLoading(false);
          return;
        }

        setStudent(studentData);

        const { data: subjectsData } = await supabase.from('subjects').select('*');
        setSubjects(subjectsData || []);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setSubmitting(true);
    setMessage('');

    try {
      // progress.subject stores the subject NAME — that is what the weak-subject
      // analytics match on — so resolve it from the selected id before logging.
      const subjectName =
        subjects.find((s) => s.id === formData.subject_id)?.name ?? formData.subject_id;

      await logStudySession(
        student.id,
        subjectName,
        formData.duration_minutes,
        'study',
        formData.notes
      );

      setMessage('✓ Study session logged successfully!');
      setFormData({ subject_id: '', duration_minutes: 30, notes: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 dark:from-dark-900 dark:to-dark-950">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 dark:from-dark-900 dark:to-dark-950">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">✗ Not logged in. Please sign in first.</p>
          <Link href="/auth/student/login" className="text-primary-600 hover:text-primary-700 font-semibold">
            Sign In →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-dark-900 dark:to-dark-950 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/dashboard/student" className="text-primary-600 hover:text-primary-700 font-semibold mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Log Study Session</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your study progress</p>
        </div>

        <div className="bg-white dark:bg-dark-900 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-dark-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Subject
              </label>
              <select
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select a subject</option>
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="What did you study?"
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.includes('✓')
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !formData.subject_id}
              className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold disabled:opacity-50 transition"
            >
              {submitting ? 'Logging...' : 'Log Session'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
