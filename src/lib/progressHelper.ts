import { supabase } from './supabase';

export interface ProgressRecord {
  id: string;
  student_id: string;
  date: string;
  subject: string;
  duration_minutes: number;
  session_type: 'study' | 'break' | 'review';
  notes?: string;
  created_at: string;
}

export interface ProgressStats {
  todayMinutes: number;
  weekMinutes: number;
  monthMinutes: number;
  bySubject: Record<string, number>; // subject -> total minutes
  recentSessions: ProgressRecord[];
}

// Today's date in Bangladesh time (UTC+6, no DST), as YYYY-MM-DD. Session dates are
// stored this way so a session logged after midnight lands on the student's own day.
export function dhakaToday(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

// The Bangladesh date `days` days before today, as YYYY-MM-DD.
function dhakaDaysAgo(days: number): string {
  const [y, m, d] = dhakaToday().split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d - days)).toISOString().slice(0, 10);
}

export async function logStudySession(
  studentId: string,
  subject: string,
  durationMinutes: number,
  sessionType: 'study' | 'break' | 'review' = 'study',
  notes?: string
) {
  const { data, error } = await supabase
    .from('progress')
    .insert([
      {
        student_id: studentId,
        date: dhakaToday(),
        subject,
        duration_minutes: durationMinutes,
        session_type: sessionType,
        notes,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProgressStats(
  studentId: string,
  weakSubjects: string[]
): Promise<ProgressStats> {
  const today = dhakaToday();
  const weekAgo = dhakaDaysAgo(7);
  const monthAgo = dhakaDaysAgo(30);

  // Fetch all progress records for this student
  const { data: allRecords, error } = await supabase
    .from('progress')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const records = allRecords || [];

  // Filter by date range
  const todayRecords = records.filter((r) => r.date === today);
  const weekRecords = records.filter((r) => r.date >= weekAgo);
  const monthRecords = records.filter((r) => r.date >= monthAgo);

  // Calculate minutes (only count 'study' sessions, not breaks)
  const todayMinutes = todayRecords
    .filter((r) => r.session_type === 'study')
    .reduce((sum, r) => sum + r.duration_minutes, 0);

  const weekMinutes = weekRecords
    .filter((r) => r.session_type === 'study')
    .reduce((sum, r) => sum + r.duration_minutes, 0);

  const monthMinutes = monthRecords
    .filter((r) => r.session_type === 'study')
    .reduce((sum, r) => sum + r.duration_minutes, 0);

  // Calculate by subject (weak subjects only)
  const bySubject: Record<string, number> = {};
  weakSubjects.forEach((subject) => {
    bySubject[subject] = monthRecords
      .filter((r) => r.subject === subject && r.session_type === 'study')
      .reduce((sum, r) => sum + r.duration_minutes, 0);
  });

  return {
    todayMinutes,
    weekMinutes,
    monthMinutes,
    bySubject,
    recentSessions: records.slice(0, 10),
  };
}
