export interface RoutineSlot {
  subject: string;
  startTime: string;
  endTime: string;
  type: 'weak' | 'strong' | 'break';
  durationMinutes: number;
}

export interface DailyRoutine {
  date: string;
  dayOfWeek: string;
  slots: RoutineSlot[];
  totalStudyMinutes: number;
  weakSubjectMinutes: number;
  strongSubjectMinutes: number;
}

export interface GeneratedRoutine {
  studentId: string;
  batchId: string;
  examDate: string;
  daysUntilExam: number;
  totalAvailableHours: number;
  routine: DailyRoutine[];
  summary: {
    weeklyWeakFocus: number; // percentage
    weeklystrongFocus: number;
    avgDailyHours: number;
  };
}

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

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const WEAK_SHARE = 0.6; // 60% of study time on weak subjects, 40% on strong
const MAX_WEAK_SESSION = 120; // weak sessions run up to 2 hours
const MAX_STRONG_SESSION = 60; // strong sessions stay at 1 hour or less
const BREAK_MINUTES = 15;
const DAY_START = 6 * 60; // 6 AM
const DAY_END = 22 * 60; // 10 PM

export function generateRoutine(
  availableHoursPerDay: number,
  weakSubjects: string[],
  examDate: Date
): GeneratedRoutine {
  const hours = Number(availableHoursPerDay);
  if (!Number.isFinite(hours) || hours <= 0) {
    throw new Error('Available hours must be greater than 0');
  }

  // Copy (and de-duplicate) so the caller's array is never mutated.
  const weak = [...new Set(weakSubjects ?? [])];
  if (weak.length === 0) {
    throw new Error('At least one weak subject must be selected');
  }

  const strong = ALL_SUBJECTS.filter((s) => !weak.includes(s));
  if (strong.length === 0) {
    // Every subject was marked weak. Move the last few over to strong rather than
    // copying them, so the 60/40 split has two real groups and no subject is in both.
    const moveCount = Math.max(1, Math.round(weak.length * (1 - WEAK_SHARE)));
    strong.push(...weak.splice(weak.length - moveCount, moveCount));
  }

  const dailyMinutes = Math.round(hours * 60);
  const weakMinutes = Math.round(dailyMinutes * WEAK_SHARE);
  const strongMinutes = dailyMinutes - weakMinutes;

  // Session lengths are the same every day; only the subjects rotate.
  const weakSessions = splitIntoSessions(weakMinutes, MAX_WEAK_SESSION);
  const strongSessions = splitIntoSessions(strongMinutes, MAX_STRONG_SESSION);
  const order = interleave(weakSessions.length, strongSessions.length);

  // Round-robin cursors carry across days, so every subject is cycled through the week.
  let weakCursor = 0;
  let strongCursor = 0;

  const now = new Date();
  const daysUntilExam = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const routine: DailyRoutine[] = [];

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    // Build the date from local components so `date` and `dayOfWeek` always agree.
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayIndex);
    const slots: RoutineSlot[] = [];
    let clock = DAY_START;
    let weakIndex = 0;
    let strongIndex = 0;

    for (let i = 0; i < order.length; i++) {
      const type = order[i];
      const planned = type === 'weak' ? weakSessions[weakIndex++] : strongSessions[strongIndex++];
      const duration = Math.min(planned, DAY_END - clock);
      if (duration <= 0) break;

      const subject =
        type === 'weak'
          ? weak[weakCursor++ % weak.length]
          : strong[strongCursor++ % strong.length];

      slots.push({
        subject,
        startTime: timeToString(clock),
        endTime: timeToString(clock + duration),
        type,
        durationMinutes: duration,
      });
      clock += duration;

      // A break between every pair of sessions, never after the last one.
      if (i < order.length - 1 && clock + BREAK_MINUTES < DAY_END) {
        slots.push({
          subject: 'Break',
          startTime: timeToString(clock),
          endTime: timeToString(clock + BREAK_MINUTES),
          type: 'break',
          durationMinutes: BREAK_MINUTES,
        });
        clock += BREAK_MINUTES;
      }
    }

    const weakDayMinutes = sumMinutes(slots, 'weak');
    const strongDayMinutes = sumMinutes(slots, 'strong');

    routine.push({
      date: formatDate(date),
      dayOfWeek: DAY_NAMES[date.getDay()],
      slots,
      totalStudyMinutes: weakDayMinutes + strongDayMinutes,
      weakSubjectMinutes: weakDayMinutes,
      strongSubjectMinutes: strongDayMinutes,
    });
  }

  const totalWeakMinutes = routine.reduce((sum, day) => sum + day.weakSubjectMinutes, 0);
  const totalStrongMinutes = routine.reduce((sum, day) => sum + day.strongSubjectMinutes, 0);
  const totalMinutes = totalWeakMinutes + totalStrongMinutes;

  return {
    studentId: '',
    batchId: '',
    examDate: examDate.toISOString().split('T')[0],
    daysUntilExam,
    totalAvailableHours: hours * 7,
    routine,
    summary: {
      weeklyWeakFocus: totalMinutes > 0 ? Math.round((totalWeakMinutes / totalMinutes) * 100) : 0,
      weeklystrongFocus: totalMinutes > 0 ? Math.round((totalStrongMinutes / totalMinutes) * 100) : 0,
      avgDailyHours: totalMinutes / (7 * 60),
    },
  };
}

// Split `total` minutes into the fewest sessions no longer than `max`, as evenly as possible.
function splitIntoSessions(total: number, max: number): number[] {
  if (total <= 0) return [];
  const count = Math.ceil(total / max);
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
}

// Alternate weak and strong sessions, starting with weak; any surplus goes at the end.
function interleave(weakCount: number, strongCount: number): Array<'weak' | 'strong'> {
  const order: Array<'weak' | 'strong'> = [];
  for (let i = 0; i < Math.max(weakCount, strongCount); i++) {
    if (i < weakCount) order.push('weak');
    if (i < strongCount) order.push('strong');
  }
  return order;
}

function sumMinutes(slots: RoutineSlot[], type: RoutineSlot['type']): number {
  return slots.filter((s) => s.type === type).reduce((sum, s) => sum + s.durationMinutes, 0);
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function timeToString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}
