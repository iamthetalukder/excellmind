'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Student {
  id: string;
  name: string;
  email: string;
  school: string;
  available_hours_per_day: number;
  weak_subjects: string[];
  status: string;
}

interface GeneratedRoutine {
  studentId: string;
  examDate: string;
  daysUntilExam: number;
  routine: Array<{
    date: string;
    dayOfWeek: string;
    slots: Array<{
      subject: string;
      startTime: string;
      endTime: string;
      type: string;
      durationMinutes: number;
    }>;
    totalStudyMinutes: number;
  }>;
  summary: {
    weeklyWeakFocus: number;
    weeklystrongFocus: number;
    avgDailyHours: number;
  };
}

export default function ManageStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [previewRoutine, setPreviewRoutine] = useState<GeneratedRoutine | null>(null);
  const [previewStudentId, setPreviewStudentId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      setMessage(`✗ Error fetching students: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const generateRoutine = async (studentId: string) => {
    setGeneratingFor(studentId);
    setMessage('');

    try {
      const response = await fetch('/api/routines/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate routine');
      }

      const data = await response.json();
      setPreviewRoutine(data.routine);
      setPreviewStudentId(studentId);
      setMessage('✓ Routine generated. Review below and click Approve.');
    } catch (error) {
      setMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGeneratingFor(null);
    }
  };

  const approveRoutine = async () => {
    if (!previewStudentId || !previewRoutine) return;

    setApprovingId(previewStudentId);

    try {
      // Update student status
      const { error: updateError } = await supabase
        .from('students')
        .update({ status: 'routine_approved' })
        .eq('id', previewStudentId);

      if (updateError) throw updateError;

      // Update routine status
      const { error: routineError } = await supabase
        .from('routines')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('student_id', previewStudentId)
        .eq('status', 'draft');

      if (routineError) throw routineError;

      setMessage(`✓ Routine approved for ${students.find((s) => s.id === previewStudentId)?.name}. Email sent.`);
      setPreviewRoutine(null);
      setPreviewStudentId(null);

      // Refresh student list
      setTimeout(() => fetchStudents(), 1000);
    } catch (error) {
      setMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Manage Students</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate and approve routines for pending enrollments.
          </p>
        </div>

        {message && (
          <div
            className={`mb-8 p-4 rounded-lg ${
              message.includes('✗')
                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
                : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
            }`}
          >
            {message}
          </div>
        )}

        {students.length === 0 ? (
          <div className="bg-white dark:bg-dark-900 p-12 rounded-xl border border-gray-200 dark:border-dark-800 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No pending students.</p>
            <Link
              href="/dashboard/instructor"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-white dark:bg-dark-900 p-8 rounded-xl border border-gray-200 dark:border-dark-800"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Name</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{student.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{student.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">School</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{student.school}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available Hours/Day</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {student.available_hours_per_day} hours
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Weak Subjects (60% focus)</p>
                  <div className="flex flex-wrap gap-2">
                    {student.weak_subjects.map((subject) => (
                      <span
                        key={subject}
                        className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => generateRoutine(student.id)}
                  disabled={generatingFor === student.id || previewStudentId === student.id}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    generatingFor === student.id || previewStudentId === student.id
                      ? 'bg-gray-100 dark:bg-dark-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  {generatingFor === student.id ? 'Generating...' : 'Generate Routine'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Preview Routine */}
        {previewRoutine && (
          <div className="mt-12 bg-white dark:bg-dark-900 p-8 rounded-xl border border-primary-200 dark:border-primary-800">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Routine Preview — {students.find((s) => s.id === previewStudentId)?.name}
            </h2>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-primary-50 dark:bg-primary-900 p-4 rounded-lg">
                <p className="text-sm text-primary-700 dark:text-primary-300 mb-1">Days Until Exam</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {previewRoutine.daysUntilExam}
                </p>
              </div>
              <div className="bg-accent-50 dark:bg-accent-900 p-4 rounded-lg">
                <p className="text-sm text-accent-700 dark:text-accent-300 mb-1">Weak Subject Focus</p>
                <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">
                  {previewRoutine.summary.weeklyWeakFocus}%
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Strong Subject Focus</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {previewRoutine.summary.weeklystrongFocus}%
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300 mb-1">Avg Daily Hours</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {previewRoutine.summary.avgDailyHours.toFixed(1)}h
                </p>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
              {previewRoutine.routine.map((day) => (
                <details
                  key={day.date}
                  className="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-700"
                >
                  <summary className="font-bold text-gray-900 dark:text-white mb-2">
                    {day.dayOfWeek} — {day.date} ({(day.totalStudyMinutes / 60).toFixed(1)}h study)
                  </summary>
                  <div className="space-y-2 text-sm">
                    {day.slots.map((slot, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded ${
                          slot.type === 'weak'
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                            : slot.type === 'strong'
                            ? 'bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="font-semibold">{slot.subject}</span>
                        <span className="ml-2">
                          {slot.startTime}–{slot.endTime} ({slot.durationMinutes}m)
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={approveRoutine}
                disabled={approvingId === previewStudentId}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                  approvingId === previewStudentId
                    ? 'bg-gray-100 dark:bg-dark-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {approvingId === previewStudentId ? 'Approving...' : '✓ Approve & Send to Student'}
              </button>
              <button
                onClick={() => {
                  setPreviewRoutine(null);
                  setPreviewStudentId(null);
                }}
                className="flex-1 py-3 bg-gray-300 dark:bg-dark-700 hover:bg-gray-400 dark:hover:bg-dark-600 text-gray-900 dark:text-white rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/dashboard/instructor"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-semibold"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
