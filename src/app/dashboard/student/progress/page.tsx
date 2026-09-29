'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { dhakaToday } from '@/lib/progressHelper';
import type { DailyRoutine } from '@/lib/routineGenerator';

const WEAK_COLOR = '#3B82F6';
const STRONG_COLOR = '#14B8A6';
const PLANNED_COLOR = '#E5E7EB';
const WEAK_TARGET = 60;
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Status = 'onTrack' | 'behind' | 'inProgress' | 'notStarted';

const STATUS_LABEL: Record<Status, string> = {
  onTrack: '✓ on track',
  behind: '⚠ behind',
  inProgress: '… in progress',
  notStarted: '— not started',
};

const STATUS_CLASS: Record<Status, string> = {
  onTrack: 'text-green-600 dark:text-green-400',
  behind: 'text-yellow-600 dark:text-yellow-400',
  inProgress: 'text-blue-600 dark:text-blue-400',
  notStarted: 'text-gray-500 dark:text-gray-400',
};

interface ProgressRow {
  date: string;
  subject: string | null;
  duration_minutes: number | null;
  session_type: string | null;
}

interface DayRow {
  date: string;
  dayName: string;
  planned: number;
  logged: number;
  status: Status;
  isToday: boolean;
}

interface SubjectRow {
  subject: string;
  planned: number;
  logged: number;
  status: Status;
}

interface WeekProgress {
  plannedWeak: number;
  plannedStrong: number;
  loggedWeak: number;
  loggedStrong: number;
  plannedBeforeToday: number;
  daysRemaining: number;
  days: DayRow[];
  subjects: SubjectRow[];
}

// Monday..Sunday of the week containing `today`. The maths runs in UTC so the
// browser's own timezone can't shift any of the dates.
function currentWeek(today: string) {
  const [y, m, d] = today.split('-').map(Number);
  const monday = new Date(Date.UTC(y, m - 1, d));
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + i);
    return { date: date.toISOString().slice(0, 10), dayName: DAY_NAMES[date.getUTCDay()] };
  });
}

function plannedMinutes(day: DailyRoutine | undefined, type: 'weak' | 'strong', subject?: string) {
  if (!day) return 0;
  return day.slots
    .filter((s) => s.type === type && (!subject || s.subject === subject))
    .reduce((sum, s) => sum + s.durationMinutes, 0);
}

function sumMinutes(rows: ProgressRow[]) {
  return rows.reduce((sum, r) => sum + (r.duration_minutes ?? 0), 0);
}

function dayStatus(date: string, today: string, planned: number, logged: number): Status {
  if (planned > 0 ? logged >= planned : logged > 0) return 'onTrack';
  if (date > today || planned === 0) return 'notStarted';
  if (date === today) return logged > 0 ? 'inProgress' : 'notStarted';
  return 'behind';
}

// A subject is on track if it has covered everything planned for it before today.
function subjectStatus(plannedWeek: number, plannedBeforeToday: number, logged: number): Status {
  if (plannedWeek > 0 && logged >= plannedWeek) return 'onTrack';
  if (plannedBeforeToday === 0) return logged > 0 ? 'inProgress' : 'notStarted';
  return logged >= plannedBeforeToday ? 'onTrack' : 'behind';
}

function buildWeek(
  routine: DailyRoutine[],
  sessions: ProgressRow[],
  weakSubjects: string[],
  today: string
): WeekProgress {
  // The routine is a 7-day template, so each day of this week uses the routine day with the same name.
  const week = currentWeek(today).map((d) => ({ ...d, plan: routine.find((r) => r.dayOfWeek === d.dayName) }));
  const studied = sessions.filter((s) => s.session_type !== 'break');
  const weakSet = new Set(weakSubjects);

  let plannedWeak = 0;
  let plannedStrong = 0;
  let plannedBeforeToday = 0;

  const days = week.map(({ date, dayName, plan }) => {
    const weak = plannedMinutes(plan, 'weak');
    const strong = plannedMinutes(plan, 'strong');
    plannedWeak += weak;
    plannedStrong += strong;
    if (date < today) plannedBeforeToday += weak + strong;

    const logged = sumMinutes(studied.filter((s) => s.date === date));
    return {
      date,
      dayName,
      planned: weak + strong,
      logged,
      status: dayStatus(date, today, weak + strong, logged),
      isToday: date === today,
    };
  });

  const loggedWeak = sumMinutes(studied.filter((s) => s.subject !== null && weakSet.has(s.subject)));
  const loggedStrong = sumMinutes(studied) - loggedWeak;

  const subjects = weakSubjects.map((subject) => {
    let planned = 0;
    let plannedBefore = 0;
    for (const { date, plan } of week) {
      const minutes = plannedMinutes(plan, 'weak', subject);
      planned += minutes;
      if (date < today) plannedBefore += minutes;
    }
    const logged = sumMinutes(studied.filter((s) => s.subject === subject));
    return { subject, planned, logged, status: subjectStatus(planned, plannedBefore, logged) };
  });

  return {
    plannedWeak,
    plannedStrong,
    loggedWeak,
    loggedStrong,
    plannedBeforeToday,
    daysRemaining: week.filter((d) => d.date > today).length,
    days,
    subjects,
  };
}

const hours = (minutes: number) => (minutes / 60).toFixed(1);

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

export default function ProgressPage() {
  const router = useRouter();
  const [view, setView] = useState<'loading' | 'error' | 'noRoutine' | 'ready'>('loading');
  const [error, setError] = useState('');
  const [week, setWeek] = useState<WeekProgress | null>(null);
  const [weekRange, setWeekRange] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/auth/student/login');
          return;
        }

        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('id, weak_subjects')
          .eq('auth_id', user.id)
          .single();

        if (studentError || !student) {
          setError('Student record not found. Please enroll first.');
          setView('error');
          return;
        }

        // Approval is what sets status = 'approved'; use the most recently approved routine.
        const { data: routineRow, error: routineError } = await supabase
          .from('routines')
          .select('routine_data')
          .eq('student_id', student.id)
          .eq('status', 'approved')
          .order('approved_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (routineError) throw routineError;

        const routine: DailyRoutine[] = routineRow?.routine_data?.routine ?? [];
        if (routine.length === 0) {
          setView('noRoutine');
          return;
        }

        const today = dhakaToday();
        const days = currentWeek(today);
        setWeekRange(`${shortDate(days[0].date)} – ${shortDate(days[6].date)}`);

        const { data: sessions, error: progressError } = await supabase
          .from('progress')
          .select('date, subject, duration_minutes, session_type')
          .eq('student_id', student.id)
          .gte('date', days[0].date)
          .lte('date', days[6].date);

        if (progressError) throw progressError;

        // Weak subjects as the routine scheduled them (it can move some to strong when
        // every subject is marked weak), falling back to the student's own list.
        const weakSubjects: string[] = [];
        for (const day of routine) {
          for (const slot of day.slots) {
            if (slot.type === 'weak' && !weakSubjects.includes(slot.subject)) weakSubjects.push(slot.subject);
          }
        }
        if (weakSubjects.length === 0) weakSubjects.push(...(student.weak_subjects ?? []));

        setWeek(buildWeek(routine, sessions ?? [], weakSubjects, today));
        setView('ready');
      } catch (err) {
        setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setView('error');
      }
    };

    load();
  }, [router]);

  if (view === 'loading') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <p className="text-gray-600 dark:text-gray-400">Loading progress...</p>
      </div>
    );
  }

  if (view === 'error') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <p className="text-red-600 dark:text-red-400 mb-4">✗ {error}</p>
        <Link href="/dashboard/student" className="text-primary-600 hover:text-primary-700 font-semibold">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (view === 'noRoutine' || !week) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-200 dark:border-dark-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Generate a routine first</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Progress is measured against your approved routine. Once your instructor generates and approves one, your
            weekly progress will show here.
          </p>
          <Link
            href="/dashboard/student/routine"
            className="inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition"
          >
            Go to My Routine
          </Link>
        </div>
      </div>
    );
  }

  const planned = week.plannedWeak + week.plannedStrong;
  const logged = week.loggedWeak + week.loggedStrong;
  const percent = planned > 0 ? Math.round((logged / planned) * 100) : 0;
  const onTrack = logged >= week.plannedBeforeToday;
  const toneText = onTrack ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400';
  const toneBar = onTrack ? 'bg-green-500' : 'bg-yellow-500';
  const weakShare = logged > 0 ? Math.round((week.loggedWeak / logged) * 100) : 0;

  const chartData = [
    { category: 'Weak Subjects', planned: week.plannedWeak / 60, logged: week.loggedWeak / 60, color: WEAK_COLOR },
    { category: 'Strong Subjects', planned: week.plannedStrong / 60, logged: week.loggedStrong / 60, color: STRONG_COLOR },
  ];
  const yMax = Math.max(1, Math.ceil(Math.max(...chartData.flatMap((d) => [d.planned, d.logged]))));

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/student" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
          ← Back to Dashboard
        </Link>
        <Link href="/dashboard/student/log-session" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
          + Log Session
        </Link>
      </div>

      {/* Weekly summary */}
      <section className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-200 dark:border-dark-800">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">This Week&apos;s Progress</h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">{weekRange}</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className={`text-3xl font-bold ${toneText}`}>{hours(logged)}h</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">logged</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{hours(planned)}h</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">planned</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{percent}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">complete</p>
          </div>
        </div>

        <div className="w-full h-3 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden mb-3">
          <div className={`h-full ${toneBar} transition-all`} style={{ width: `${Math.min(percent, 100)}%` }} />
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          {logged === 0 ? (
            <>
              Nothing logged yet this week — every hour counts.{' '}
              <Link href="/dashboard/student/log-session" className="text-primary-600 hover:text-primary-700 font-semibold">
                Log your first session
              </Link>
            </>
          ) : onTrack ? (
            <>On track: {hours(week.plannedBeforeToday)}h was planned before today.</>
          ) : (
            <>
              Behind: {hours(week.plannedBeforeToday)}h was planned before today, {hours(logged)}h logged.
            </>
          )}{' '}
          {week.daysRemaining > 0 && `${week.daysRemaining} day${week.daysRemaining === 1 ? '' : 's'} left this week.`}
        </p>
      </section>

      {/* Weak vs strong */}
      <section className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-200 dark:border-dark-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Weak vs Strong</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {logged > 0
            ? `Weak subjects are ${weakShare}% of your logged time (target ${WEAK_TARGET}%).`
            : `Target: ${WEAK_TARGET}% of study time on weak subjects.`}
        </p>

        <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400 mb-2">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ background: PLANNED_COLOR }} /> Planned
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ background: WEAK_COLOR }} /> Logged (weak)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ background: STRONG_COLOR }} /> Logged (strong)
          </span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#9CA3AF" strokeOpacity={0.3} />
              <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis domain={[0, yMax]} allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} unit="h" />
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)}h`} cursor={{ fill: 'rgba(156, 163, 175, 0.15)' }} />
              <Bar dataKey="planned" name="Planned" fill={PLANNED_COLOR} radius={[4, 4, 0, 0]} />
              <Bar dataKey="logged" name="Logged" radius={[4, 4, 0, 0]}>
                {chartData.map((d) => (
                  <Cell key={d.category} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Daily breakdown */}
      <section className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-200 dark:border-dark-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Daily Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-dark-800">
                <th className="py-2 pr-2 font-medium">Day</th>
                <th className="py-2 px-2 font-medium text-right">Planned</th>
                <th className="py-2 px-2 font-medium text-right">Logged</th>
                <th className="py-2 pl-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {week.days.map((day) => (
                <tr
                  key={day.date}
                  className={`border-b border-gray-100 dark:border-dark-800 last:border-0 ${
                    day.isToday ? 'bg-primary-50 dark:bg-dark-800' : ''
                  }`}
                >
                  <td className="py-2 pr-2 text-gray-900 dark:text-white">
                    {day.dayName.slice(0, 3)} <span className="text-gray-500 dark:text-gray-400">{shortDate(day.date)}</span>
                    {day.isToday && <span className="ml-1 text-xs font-semibold text-primary-600">today</span>}
                  </td>
                  <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">{hours(day.planned)}h</td>
                  <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">{hours(day.logged)}h</td>
                  <td className={`py-2 pl-2 whitespace-nowrap ${STATUS_CLASS[day.status]}`}>{STATUS_LABEL[day.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Subject breakdown */}
      <details open className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-200 dark:border-dark-800">
        <summary className="text-lg font-bold text-gray-900 dark:text-white cursor-pointer">Weak Subject Breakdown</summary>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-dark-800">
                <th className="py-2 pr-2 font-medium">Subject</th>
                <th className="py-2 px-2 font-medium text-right">Planned</th>
                <th className="py-2 px-2 font-medium text-right">Logged</th>
                <th className="py-2 pl-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {week.subjects.map((row) => (
                <tr key={row.subject} className="border-b border-gray-100 dark:border-dark-800 last:border-0">
                  <td className="py-2 pr-2 text-gray-900 dark:text-white">{row.subject}</td>
                  <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">{hours(row.planned)}h</td>
                  <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">{hours(row.logged)}h</td>
                  <td className={`py-2 pl-2 whitespace-nowrap ${STATUS_CLASS[row.status]}`}>{STATUS_LABEL[row.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
