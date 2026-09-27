'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const ALL_SUBJECTS = [
  'Bengali',
  'English',
  'Math',
  'Higher Math',
  'Physics',
  'Chemistry',
  'Biology',
  'Social Science',
  'Islamic Studies',
];

export default function StudentSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    weakSubjects: ['Math', 'Physics'],
    availableHours: 5,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubjectToggle = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      weakSubjects: prev.weakSubjects.includes(subject)
        ? prev.weakSubjects.filter((s) => s !== subject)
        : [...prev.weakSubjects, subject],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.weakSubjects.length === 0) {
      setMessage('✗ Select at least one weak subject.');
      setLoading(false);
      return;
    }

    try {
      const { data: batchData, error: batchError } = await supabase
        .from('batches')
        .select('id')
        .eq('name', 'SSC 2028')
        .single();

      if (batchError || !batchData) {
        setMessage('✗ Batch not found. Contact support.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('students')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            school: formData.school,
            weak_subjects: formData.weakSubjects,
            available_hours_per_day: formData.availableHours,
            batch_id: batchData.id,
            status: 'pending',
            tutor_assignments: {},
          },
        ])
        .select()
        .single();

      if (error) {
        setMessage(`✗ Error: ${error.message}`);
        setLoading(false);
        return;
      }

      if (data) {
        sessionStorage.setItem('studentId', data.id);
        setMessage('✓ Enrollment successful! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard/student');
        }, 1500);
      }
    } catch (error) {
      setMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-dark-900 dark:to-dark-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-dark-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-dark-800">
          <h2 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Enroll for SSC 2028</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Join your personalized exam preparation program with ExcelMind.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  School / College
                </label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                Weak Subjects (at least 1)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ALL_SUBJECTS.map((subject) => (
                  <label key={subject} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.weakSubjects.includes(subject)}
                      onChange={() => handleSubjectToggle(subject)}
                      className="w-4 h-4 text-primary-600 bg-white dark:bg-dark-800 border-gray-300 dark:border-dark-700 rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{subject}</span>
                  </label>
                ))}
              </div>
              {formData.weakSubjects.length === 0 && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">Select at least one subject</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Available Study Hours Per Day
              </label>
              <input
                type="number"
                min="0.5"
                max="12"
                step="0.5"
                value={formData.availableHours}
                onChange={(e) => setFormData({ ...formData, availableHours: parseFloat(e.target.value) })}
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
              disabled={loading || formData.weakSubjects.length === 0}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold disabled:opacity-50 transition"
            >
              {loading ? 'Enrolling...' : 'Enroll'}
            </button>

            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Are you an instructor?</span>
              <Link href="/auth/instructor/signup" className="text-primary-600 hover:text-primary-700 font-semibold">
                Instructor Signup →
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
